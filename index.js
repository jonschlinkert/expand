'use strict';

var get = require('get-value');
var set = require('set-value');
var isObject = require('is-plain-object');
var template = require('lodash')._.template;

function expand(value, context, settings) {
  if (value == null) {
    throw new TypeError('expand expects a string, array or object.');
  }

  if (arguments.length === 1) {
    context = value;
  }

  var fn = expand.render(context, settings);

  if (typeof value === 'string') {
    if (!has(value, '<%') && !has(value, '${')) {
      var res = get(context, value);
      if (res) {
        return expand(res, context);
      }
      return value;
    }
    return fn(value);
  }

  if (Array.isArray(value)) {
    var len = value.length;
    while (len--) {
      value[len] = expand(value[len], context, settings);
    }
    return value;
  }

  if (!isObject(value)) {
    throw new TypeError('expand expects a string, array or object.');
  }

  var o = {};
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      var val = value[key];
      if (typeof val === 'string') {
        set(o, key, fn(val));
      } else if (typeof val === 'object') {
        set(o, key, expand(val, context));
      }
    }
  }
  return o;
}

expand.render = function render_(context, settings) {
  var re = /(?:<%=\s*([\w._]*?)\s*%>|\${\s*([\w._]*?)\s*})\s*/g;
  return function (str) {
    var prop, res;

    str.replace(re, function (match, $1, $2) {
      if (!match || match === str) {
        prop = ($1 || $2);
        return '';
      }
      res = match;
    });

    res = res || str;
    if (prop) {
      res = get(context, prop);
      if (typeof res === 'string') {
        return expand(res, context, settings);
      }
    }

    // strings
    if (typeof res === 'string') {
      return expandString(str, context, settings)
    }
    // objects
    if (typeof res === 'object') {
      return expandObject(res, context, settings);
    }
    return res;
  };
}

expand.get = function get_(prop, obj) {
  return get(expand(obj, obj), prop);
};

/**
 * Recursively resolve templates.
 *
 * @param  {String} `str`
 * @param  {Object} `data`
 * @param  {Object} `settings`
 * @return {String}
 */

expand.interpolate = function interpolate_(str, data, settings) {
  if (typeof str !== 'string') {
    throw new TypeError('interpolate expects a string.');
  }
  while (has(str, '<%') || has(str, '${')) {
    var last = str;
    str = template(str, settings)(data);
    if (str === last) { return str; }
  }
  return str;
};

function expandString(str, context, settings) {
  // helpers
  if (has(str, '<%') || has(str, '${')) {
    str = expand.interpolate(str, context, settings);
  }
  // expand array syntax
  if (str.charAt(0) === '[' && str[str.length - 1] === ']') {
    return str.slice(1, str.length - 1).split(',');
  }
  return str;
}

function expandObject(obj, context, settings) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = expand(obj[key], context, settings);
    }
  }
  return obj;
}

/**
 * Returns true if `str` has the given `characters`
 *
 * @param  {String} `str`
 * @param  {String} `ch` Characters to search for
 * @return {Boolean}
 */

function has(str, ch) {
  return str.indexOf(ch) !== -1;
}

/**
 * Expose `expand`
 */

module.exports = expand;
