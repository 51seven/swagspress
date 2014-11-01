/**
 * Build Swagger object from Swagger Doc
 */

module.exports = function(doc, config) {
  var swagger = doc;
  swagger['x-swagspress-config'] = config;

  return swagger;
}