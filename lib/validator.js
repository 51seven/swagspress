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

/**
 * created message for a parameter in
 * a wrong type
 * @param  {String} name name of parameter
 * @param  {String} type type of parameter
 * @return {Object}      BadRequest with message
 */
function wrongParamType(name, type) {
  var a = 'a';
  if(_.contains['a', 'e', 'i', 'o', 'u'], type[0]) a = 'an';
  return new BadRequest('Parameter '+name+' has to be '+verb+' '+type);
}

/**
 * parse comma/space/tab/pipe/multi seperated
 * string as an array
 * @param  {String} arr  string to parse
 * @param  {String} type method to parse
 * @return {Array}       parsed string as array
 */
function parseArray(arr, type) {
  var parsed, split;
  switch(type) {
    case 'csv':
      split = ',';
      break;
    case 'ssv':
      split = ' ';
      break;
    case 'tsv':
      split = '\t';
      break;
    case 'pipes':
      split = '|';
      break;
    case 'multi':
      split = 'multi';
      break;
    default:
      split = ',';
  }

  if(split !== 'multi')
    parsed = arr.split(split);
  else
    parsed = qs.parse(arr);

  return parsed;
}

function checkUnique(arr) {
  var found = true;
  var i;
  arr.forEach(arr, function(val) {
    if(_.findIndex(arr, val) !== -1) {
      found = false;
    }
  });
  return found;
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
      var param, array;
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
      if((param === undefined || param === null) && p.default !== undefined)
        param = p.default;

      // parse parameter to defined type and throw error
      // if parameter is a wrong type
      switch(p.type) {
        case 'number':
        case 'integer':
          if(!isNaN(param))
            param = parseFloat(param);
          else
            return next(wrongParamType(p.name, p.type));
          break;
        case 'boolean':
          if(param === 'true' || param === 'false')
            param = (param === true);
          else
            return next(wrongParamType(p.name, p.type));
          break;
        case 'file':
          if(param.path === undefined) // don't know how to check if param is file
            return next(wrongParamType(p.name, p.type));
          break;
        case 'array':
          array = parseArray(array);
          if(array.length > 1)
            param = array;
          else
            return next(wrongParamType(p.name, p.type));
          break;
        case 'string':
          if(typeof param !== 'string')
            return next(wrongParamType(p.name, p.type));
      }

      // check numbers and integers
      if(p.type === 'number' || p.type === 'integer') {
        // maximum, val <= max (exclusive maximum: val < max)
        if(p.maximum) {
          if(p.exclusiveMaximum) {
            if(param >= p.maximum)
              return next(new BadRequest('Parameter '+p.name+' has to be lower than '+p.maximum));
          } else {
            if(param > p.maximum)
              return next(new BadRequest('Parameter '+p.name+' has to be lower or equals than '+p.maximum));
          }
        }
        // minimum, val >= min (exlusive minimum: val > min)
        if(p.minimum) {
          if(p.exclusiveMinimum) {
            if(param <= p.minimum)
              return next(new BadRequest('Parameter '+p.name+' has to be greater than '+p.minimum));
          } else {
            if(param < p.minimum)
              return next(new BadRequest('Parameter 'p.name+' has to be greater or equals than '+p.minimum));
          }
        }
        // val is a multiple of x
        if(p.multipleOf) {
          if(param%p.multipleOf !== 0)
            return next(new BadRequest('Parameter '+p.name+' has to be a multiple of '+p.multipleOf));
        }
      }

      // check string
      if(p.type === 'string') {
        // maximum length
        if(p.maxLength) {
          if(param > p.maxLength)
            return next(new BadRequest('Parameter '+p.name+' has to be a length lower or equals than '+p.maxLength));
        }
        // minimum length
        if(p.minLength) {
          if(param < p.minLength)
            return next(new BadRequest('Parameter '+p.name+' has to be a length greater or equals than '+p.minLength));
        }
        // regex test
        if(p.pattern) {
          var re = new RegExp(p.pattern);
          if(!re.test(pattern))
            return next(new BadRequest('Parameter '+p.name+' has to match the following expression: '+p.pattern));
        }
        // in enum
        if(p.enum) {
          if(_.findIndex(p.enum, param) === -1)
            return next(new BadRequest('Parameter '+p.name+' has to be in set ['+p.enum.join(',')+']'));
        }
      }

      // TODO: what's with objects? meh
      // check array. just arrays, not objects
      if(p.type === 'array' && param typeof Array) {
        // maximum of items
        if(p.maxItems) {
          if(param.length > p.maxItems)
            return next(new BadRequest('Parameter '+p.name+' has to be less or equals items than '+p.maxItems));
        }
        // minimum of items
        if(p.minItems) {
          if(param.length < p.minItems)
            return next(new BadRequest('Parameter '+p.name+' has to be more or equals items than '+p.minItems));
        }
        // unique items
        if(p.uniqueItems) {
          if(!checkUnique(param))
            return next(new BadRequest('Parameter '+p.name+' must only have unique items'));
        }
      }

    });

    // all tests passed here
    next();
  }
}