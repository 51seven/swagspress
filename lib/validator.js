var _ = require('lodash')
  , qs = require('qs');


/**
 * HTTP Error 406 - Not Acceptable
 */
var NotAcceptable = function(message) {
  var err = new Error(message);
  err.status = 406;
  return err;
}

/**
 * HTTP Error 400 - Bad Request
 */
var BadRequest = function(message) {
  var err = new Error(message);
  err.status = 400;
}

/**
 * HTTP Error 403 - Forbidden
 */
var Forbidden = function(message) {
  var err = new Error(message);
  err.status = 403;
}

exports.mimetype = function(swagger, operation) {
  return function(req, res, next) {
    var global = swagger.consumes
      , specific = operation.consumes;

    // Check if operation has consumes to override
    var consumes;
    if (specific === undefined || specific.length === 0)
      consumes = global;
    else
      consumes = specific;

    // if request is not in consumes array
    // throw 406 Not Acceptable
    if(!req.is(consumes)) {
      return next(new NotAcceptable('Mimetype is not supported on this operation'));
    }

    next();
  }
}

exports.parameters = function(params, ref) {
  return function(req, res, next) {
    _.assign(req.body, req.files);

    params.forEach(function(p) {

      // First collect params from all types
      var param;
      switch(p.in) {
        case 'path':
          param = req.param(p);
          break;
        case 'query':
          param = req.query[p.name];
          break;
        case 'header':
          param = req.get(p);
          break;
        case 'body':
        case 'formData':
          param = req.body[p];
          break;
      }

      // Check if parameter is required but undefined
      if((param === undefined || param === null) && p.required)
        return next(new BadRequest('Parameter '+p.name+' is required in '+p.in));

      // Check if default parameter is set (and set it)
      if(param === undefined || param === null && p.default !== undefined)
        param = p.default;

      // When `in` is body, we need to check the schema
      // we will to this later
      if(p.in !== 'body') {
        if(param === 'true' || param === 'false') {
          // convert param to boolean
          param = (param === 'true');
        } else if((p.type === 'number' || p.type === 'integer') && !isNaN(param)) {
          // convert param to Int/Float
          param = parseFloat(param);
        } else if(p.type === 'array') {
          var collectionFormat;
          if(p.collectionFormat === undefined)
            collectionFormat = 'csv';
          switch(collectionFormat) {
            case 'csv':
              param = param.split(',');
              break;
            case 'ssv':
              param = param.split(' ');
              break;
            case 'tsv':
              param = param.split('\t');
              break;
            case 'pipes':
              param = param.split('|');
              break;
            case 'multi':
              param = qs.parse(param);
              break;
          }
        }
      }
    })
  }
}