swagspress
==========

swagspress is a middleware to implement an API with [Swagger](http://swagger.io) into an express.js server. _This only supports Swagger Spec 2.0._

## Features

- Validation of the swagger file
- Creating all routes defined in the swagger file
- Mapping routes to the defined controller
- Global Authentication and individual Authentication for each route (WIP)
- Only allows requests with the defined mimetypes
- Validate the request parameters (WIP)
- Convert the request parameters into the defined types (WIP)
- Support of `req.files` when using [multer](https://github.com/expressjs/multer), [connect-multiparty](https://github.com/andrewrk/connect-multiparty) or other multipart/form-data parser

## How to use

```javascript
var express = require('express');
var path = require('path');
var swagger = require('swagspress');

var app = express();

app.use(swagger({
  controller: path.join(__dirname, 'controller'),
  doc: path.join(__dirname, 'swagger.json')
}));
```

Be sure to include swagspress **after** `method-override`, `body-parser` and other middleware parsing the incoming request.

### Options

`controller` **required**  
Path to the directory where your controllers are located. _Be sure to use `__dirname` to build the path._

`doc` **required**  
Path to your swagger documentation file. This don't has to be the whole JSON, you can also build it yourself out of different parts. _Be sure to use `__dirname` to build the path._

### In your swagger doc

Use `x-controller` to define which controller to use.

```JSON
{
  "paths": {
    "/pets": {
      "get": {
        "description": "Returns all pets from the system that the user has access to",
        "x-controller": "pets",
        "operationId": "listAll",
        "produces": [
          "application/json",
        ]
```

This will call the `listAll` function of `pets.js` in your defined controller directory.

_controller/pets.js_  
```javascript
exports.listAll = function(req, res) {
  res.send('Hello world!');
}
```

## TODO
Check the [milestones](https://github.com/51seven/swagspress/milestones?state=open) to find out what we are working on. Feel free to report issues or request features.

## License

[MIT](https://github.com/51seven/swagspress/blob/master/LICENSE)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.