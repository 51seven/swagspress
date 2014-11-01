var express = require('express')
  , _ = require('lodash')
  , path = require('path')
  , validate = require('./validator');

var baseRouter = require('express').Router()
  , router = require('express').Router();


/**
 * helper function to convert paths with parameters
 * from /path/{param} format to /path/:param format
 * @param  {String} path old path in swagger format
 * @return {String}      new path in express format
 */
function convertPath(path) {
  var a = path.replace('{', ':');
  var b = a.replace('}', '');
  return b;
}

module.exports = function(swagger) {
  // Loop through all avaible paths
  _.forEach(swagger.paths, function(methods, path) {

    // Each path has is methods, the operations and
    // definitions are stored there
    _.forEach(methods, function(operation, method) {
      router[method](swagger.basePath + convertPath(path),
        validate.authentication(swagger, operation),
        validate.mimetype(swagger, operation),
        validate.parameters(operation.parameters),
        startController(operation['x-controller'], operation['operationId'], swagger['x-swagspress-config'])
      );
    });
  });

  return router;
}

/**
 * require a operation of a controller
 * @param  {String} file        controller file name/path
 * @param  {String} operationId name of operation in controller
 * @param  {Object} config      swagspress config object
 */
function startController(file, operationId, config) {
  return require(path.join(config.controller, file))[operationId];
}