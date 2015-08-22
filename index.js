'use strict';

var get = require('get-value');
var isPrimitive = require('is-primitive');
var typeOf = require('kind-of');
var engine = require('engine')();

var regex = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}|<%=([\s\S]+?)%>/gi;

function expand(val, data, options) {
  return resolve(val, data || val, options);
}

expand.parent = [];

expand.get = function (key, data) {
  return expand(get(data, key) || key, data);
};

function render(str, data, opts) {
  try {
    var val = engine.render(str, data, opts);
    if (val === str) return val;
    return render(val, data, opts);
  } catch(err) {
    console.log(err);
  }
}

function resolve(val, data, options) {
  switch(typeOf(val)) {
    case 'function':
      return val;
    case 'string':
      return resolveString(val, data, options);
    case 'object':
      return resolveObject(val, data, options);
    case 'array':
      return resolveArray(val, data, options);
    default: {
      return val;
    }
  }
}

function resolveString(str, data, options) {
  var result = str;

  str.replace(regex, function (match, es6, erb) {
    var prop = trim(es6 || erb);
    var val;

    if (/\(.*\)/.test(prop)) {
      val = render(match, data, options);
    } else {
      val = get(data, prop.trim());
    }

    if (isPrimitive(val)) {
      if (str.length > match.length) {
        result = str.split(match).join(val);
      } else {
        result = val;
      }
    } else if (val) {
      result = resolve(val, data);
    }

    // if (/[()]/.test(prop)) {
    //   var val = render(match, data, options);
    //   if (val) result = str.split(match).join(val);
    // } else {
    //   var m;
    //   if (m = /(?:\.\.\/|parent)/.exec(prop)) {
    //     prop = prop.split(m[0]).join('parent.');
    //     var val = get(expand.parent.pop(), prop);
    //     if (val) result = str.split(match).join(val);
    //   } else {
    //     var parts = prop.split('.');
    //     parts.pop();
    //     expand.parent.push(get(data, parts.join('.')));
    //   }

    //   if (result === str) {
    //     result = get(data, prop);
    //   }

    //   if (typeof result !== 'string' || /<%|${/.test(result)) {
    //     result = resolve(data, result, options);
    //   }
    // }
  });
  return result;
}

function resolveArray(arr, data, options) {
  return arr.map(function (val) {
    return resolve(val, data, options);
  });
}

function resolveObject(obj, data, options) {
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = resolve(obj[key], data, options);
    }
  }
  return result;
}

function trim(str) {
  return str == null ? '' : str.trim();
}

module.exports = expand;
