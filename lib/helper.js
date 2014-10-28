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

function parseRefPath(refpath) {
  if(refpath[0] !== '#') {
    refpath = '.definitions.'+ref;
  } else {
    refpath = refpath.substring(1).split('/').join('.');
  }

  return refpath;
}

function getObjectByRef(refPath, swagger) {
  var result = Object.byString(swagger, refPath);
  if(!result) {
    console.log('swagspress found a ref which cannot be resolved');
    return false;
  }
  return result;
}

exports.solveSchema = function(obj, key, swagger) {
  var refPath;
  if(key) refPath = obj;
  else refPath = obj.schema.$ref;
  if(refPath.substring(0,4) === 'http') {
    console.log('swagspress cannot resolve http refs');
    return false;
  }

  refPath = parseRefPath(refpath);
  var ref = getObjectByRef(refPath, swagger);

  if(ref.allOf) {
    var refPath2nd = parseRefPath(ref.allOf[0].$ref);
    var ref2nd = getObjectByRef(refPath2nd, swagger);
    ref = _.defaults(ref.allOf[1], ref2nd);
    return ref;
  }

}