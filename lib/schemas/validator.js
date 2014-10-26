/**
 * Validate Swagger Docs against the Swagger schema v2.0
 */

var jjv = require('jjv')
  , jjve = require('jjve')
  , color = require('colors');

var env = jjv();
var je = jjve(env);

var swaggerSchema = require('./swagger.json')
  , jsonDraftSchema = require('./json-draft-04.json')
  , jsonDraftURL = 'http://json-schema.org/draft-04/schema';

function printError(error, index) {
  var i = index+1;
  var spaces = '    ';
  if(i < 10) spaces = '   ';

  // Error Number and Code
  console.log('%d) %s'.gray, i, error.code);

  // Error Message
  console.log('%s%s', spaces, error.message);

  // Building Error Path
  var errorPathParts = (error.path).split('.');
  errorPathParts.splice(0, 1);
  var errorPath = errorPathParts.join(' > ');
  console.log('%sin '.gray + '%s', spaces, errorPath);
  console.log('');
}

module.exports = function(swaggerDoc) {

  // adding basePath to required values
  // because this is the entry point of the api
  swaggerSchema.required.push('basePath');

  // support hosts without dot, see https://github.com/acornejo/jjv/issues/24
  env.addFormat('uri', function() {
    return true;
  });

  // swagger 2.0 relies on JSON draft-04
  env.addSchema(jsonDraftURL, jsonDraftSchema);

  // validate swagger doc against swagger schema
  var result = env.validate(swaggerSchema, swaggerDoc);

  // validation error handling
  if(result) {
    var errors = je(swaggerSchema, swaggerDoc, result);
    if (errors) {
      // some helper
      var errNumber = errors.length;
      var errVerb = 'Errors';
      if(errNumber === 1) errVerb = 'Error';

      // Formatting of error output
      console.log('%d %s in your swagger doc'.red, errNumber, errVerb);
      console.log('============================='.red);
      console.log();
      errors.forEach(printError);
      console.log();
      console.log('============================='.red);
      console.log('Stopping server...'.red);

      // If something fails the server has to be stopped
      process.exit(0);
    }
  }
}