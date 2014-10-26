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
  // Set base path as the entry point of the api
  // and pass the api routes into this base router
  return router.use(swagger.basePath, apiRoutes(swagger));
}

/**
 * build all api routes
 * @param  {Object} swagger swagger object
 * @return {Object}         router
 */
function apiRoutes(swagger) {
  // Loop through all avaible paths
  _.forEach(swagger.paths, function(methods, path) {

    // Each path has is methods, the operations and
    // definitions are stored there
    _.forEach(methods, function(operation, method) {
      router[method](convertPath(path),
        //validate.authentication(swagger, operation, swagger['x-swagspress-config']),
        validate.mimetype(swagger, operation),
        //validate.parameter(operation),
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