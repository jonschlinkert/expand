'use strict';

var lazy = require('lazy-cache')(require);
lazy('is-primitive', 'isPrimitive');
lazy('kind-of', 'typeOf');
lazy('get-value', 'get');
lazy('engine');
var cache = {prev: null};

/**
 * Resolve templates in the given string, array or object.
 *
 * @param {String|Array|Object} `value` The value with templates to resolve.
 * @param {Object} `data`
 * @param {Object} `options`
 * @return {any} Returns a string, object or array.
 */

function expand(val, data, options) {
  return resolve(val, data || val, options);
}

expand.get = function (key, data) {
  return expand(lazy.get(data, key) || key, data);
};

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
  var regex = options.regex || lazy.engine.utils.delimiters;
  var result = str;

  str.replace(regex, function (match, es6, erb) {
    var prop = trim(es6 || erb), val;

    // return if `prop` is an empty string or undefined
    if (!prop) return match;

    // if prop is a function, pass to renderer
    if (/\(.*\)/.test(prop)) {
      var exp = '<%= ' + prop + ' %>';
      val = render(exp, data, options);
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
      // prevent infinite loops
      if (result === cache.prev) return match;

      cache.prev = result;
      result = resolve(val, data, options);
    }

    if (typeof result === 'string' && regex.test(result)) {
      result = resolveString(result, data, options);
    }
  });
  return result;
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

/**
 * Render templates in a `string` with the given `data`.
 */

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

function trim(str) {
  return str == null ? '' : String(str).trim();
}

/**
 * Expose `expand`
 */

module.exports = expand;
