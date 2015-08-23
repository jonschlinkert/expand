'use strict';

var lazy = require('lazy-cache')(require);
lazy('get-value', 'get');
lazy('is-primitive', 'isPrimitive');
lazy('kind-of', 'typeOf');
lazy('engine');

var delimRegex = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}|<%=([\s\S]+?)%>/gi;

function expand(val, data, options) {
  return resolve(val, data || val, options);
}

expand.parent = [];

expand.get = function (key, data) {
  return expand(lazy.get(data, key) || key, data);
};

function render(str, data, opts) {
  var engine = lazy.engine();
  try {
    var val = engine.render(str, data, opts);
    if (val === str) return val;
    return render(val, data, opts);
  } catch(err) {
    // don't throw, just inform the user
    console.error(err);
    return;
  }
}

function resolve(val, data, options) {
  switch(lazy.typeOf(val)) {
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
  options = options || {};
  var regex = options.regex || delimRegex;
  var result = str;

  str.replace(regex, function (match, es6, erb, args) {
    var prop = trim(es6 || erb);
    var val;

    if (/\(.*\)/.test(prop)) {
      var m = '<%= ' + prop + ' %>';
      val = render(m, data, options);
    } else {
      val = lazy.get(data, prop);
    }

    if (lazy.isPrimitive(val)) {
      if (str.length > match.length) {
        result = str.split(match).join(val);
      } else {
        result = val;
      }
    } else if (val) {
      result = resolve(val, data, options);
    }

    if (typeof result === 'string' && regex.test(result)) {
      result = resolveString(result, data, options);
    }

    str = result;
  });
  return str;
}

function resolveArray(arr, data, options) {
  var len = arr.length, i = -1;
  var res = new Array(len);

  while (++i < len) {
    res[i] = resolve(arr[i], data, options);
  }
  return res;
}

function resolveObject(obj, data, options) {
  var res = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      res[key] = resolve(obj[key], data, options);
    }
  }
  return res;
}

function trim(str) {
  return str == null ? '' : String(str).trim();
}

module.exports = expand;
