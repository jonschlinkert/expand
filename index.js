'use strict';

var utils = require('./utils')(require);
var cache = {prev: null};

/**
 * Resolve templates in the given string, array or object.
 *
 * ```js
 * expand({a: '<%= b %>', b: 'FOO'});
 * //=> {a: 'FOO', b: 'FOO'}
 * ```
 *
 * @param {String|Array|Object} `value` The value with templates to resolve.
 * @param {Object} `data`
 * @param {Object} `options`
 * @return {any} Returns a string, object or array.
 * @api public
 */

function expand(val, data, options) {
  return resolve(val, data || val, options);
}

expand.get = function (key, data) {
  return expand(utils.get(data, key) || key, data);
};

function resolve(val, data, options) {
  switch(utils.typeOf(val)) {
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
  var regex = utils.createRegex(options);

  if (!regex.test(str)) return str;
  var result = str;

  str.replace(regex, function (match, es6, erb, index) {
    var prop = utils.trim(es6 || erb);
    var val;

    if (utils.typeOf(erb) === 'number') {
      index = erb;
    }

    // return if `prop` is an empty string or undefined
    if (!prop) return;

    // if prop is a function, pass to renderer
    if (/[()]/.test(prop)) {
      var exp = '<%= ' + prop + ' %>';
      val = render(exp, data, options);
    } else {
      val = data[prop] || utils.get(data, prop);
    }

    if (utils.isPrimitive(val)) {
      if (utils.typeOf(index) !== 'number') {
        index = str.indexOf(match);
      }

      var len = match.length;
      if (str.length > len) {
        var head = str.slice(0, index);
        var tail = str.slice(index + len);
        result = head + val + tail;
      } else {
        result = val;
      }

    } else if (val) {
      // prevent infinite loops
      if (result === cache.prev) return;

      cache.prev = result;
      result = resolve(val, data, options);
    }

    if (typeof result === 'string') {
      result = resolveString(result, data, options);
    }
  });

  return result;
}

function resolveArray(arr, data, options) {
  var len = arr.length, i = -1;
  while (++i < len) {
    arr[i] = resolve(arr[i], data, options);
  }
  return arr;
}

function resolveObject(obj, data, options) {
  for (var key in obj) {
    obj[key] = resolve(obj[key], data, options);
  }
  return obj;
}

/**
 * Render templates in a `string` with the given `data`.
 */

function render(str, data, opts) {
  var engine = utils.engine();
  try {
    var val = engine.render(str, data, opts);
    if (val === str) return val;
    return render(val, data, opts);
  } catch(err) {
    return console.error(err);
  }
}

/**
 * Expose `expand`
 */

module.exports = expand;
