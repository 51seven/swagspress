var express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , swagger = require('../../lib/swagspress')
  , path = require('path');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

app.use(swagger({
  doc: path.join(__dirname, 'swagger.json'),
  controller: path.join(__dirname, 'controller')
}));

app.listen(3000);

module.exports = app;