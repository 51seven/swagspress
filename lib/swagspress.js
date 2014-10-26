var validator = require('./schemas/validator')
  , builder = require('./builder')
  , router = require('./router');

module.exports = function(config) {
  // Fetch swagger doc
  var swaggerDoc = require(config.doc);

  // Validate swagger doc
  validator(swaggerDoc);

  // Build object from swagger doc
  var swagger = builder(swaggerDoc, config);

  // Start router
  return router(swagger);
}