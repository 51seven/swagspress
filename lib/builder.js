/**
 * Build Swagger object from Swagger Doc
 */

var traverse = require('traverse');

// see http://stackoverflow.com/a/6491621/2376069
Object.byString = function(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1');
  s = s.replace(/^\./, '');          
  var a = s.split('.');
  while (a.length) {
      var n = a.shift();
      if (n in o) {
          o = o[n];
      } else {
          return;
      }
  }
  return o;
}

module.exports = function(doc, config) {
  // traverse swagger doc to map $ref's
  var expanded = traverse(doc).map(function(val) {
    if(this.key === '$ref') {

      // http ref's are not yet supported
      if(val.substring(0,4) === 'http') {
        console.log('swagspress doesn\'t support external $refs yet'.red);
        console.log('Stopping server...'.red);
        process.exit(0);
      }

      else {

        // find correct path to ref
        var refPath;
        if(val.substring(0,1) === '#')
          refPath = val.substring(1).split('/').join('.');
        else
          refPath = this.path[0]+'.'+val;

        // get referenced object
        var ref = Object.byString(doc, refPath);
        if(ref === undefined) {
          console.log('swagspress found a $ref which cannot be resolved'.red);
          console.log('Stopping server...'.red);
          process.exit(0);
        }

        // we are now in a leaf with the key $ref,
        // the value is the reference path. so the
        // object has to be assigned to the parent
        this.parent.node = ref;
      }
    }
  });

  // put config into swagger object
  expanded['x-swagspress-config'] = config;

  return expanded;
}