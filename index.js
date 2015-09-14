'use strict';

var get = require('get-value');
var utils = require('./utils');

function expand(options) {
  options = options || {};
  var regex = utils.createRegex(options);

  function resolve(val, data) {
    data = data || val;

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

  function resolveString(str, data) {
    var m;

    while (m = regex.exec(str)) {
      var orig = str;
      var prop = (m[1] || m[2] || '').trim();
      var match = m[0];

      if (!match) return str;
      var len = match.length;
      var i = m.index;

      var val = match;
      if (/[()]/.test(prop)) {
        prop = '<%= ' + prop + ' %>';
        val = render(prop, data, options);
      } else {
        val = get(data, prop);
      }

      // if no value was retured from `get` or `render`,
      // reset the value to `match`
      val = val || match;

      // if the value is an object, recurse to resolve
      // templates in the keys and values of the object
      if (typeof val === 'object') {
        val = resolve(val, data, options);

      } else if (typeof val !== 'function') {
        val = String(val);
      }

      if (typeof val === 'function') {
        return val.bind(data);
      }

      if (typeof val !== 'string') {
        str = val;
        break;
      }

      var head = str.slice(0, i);
      var tail = str.slice(i + len);

      str = head + val + tail;
      if (str === orig) break;
    }
    return str;
  }

  function resolveArray(arr, data) {
    var len = arr.length, i = -1;
    while (++i < len) {
      arr[i] = resolve(arr[i], data);
    }
    return arr;
  }

  function resolveObject(obj, data) {
    for (var key in obj) {
      obj[key] = resolve(obj[key], data);
    }
    return obj;
  }

  function render(str, data, options) {
    // we re-create the delims as native erb-like delims,
    // so we don't want the custom regex passed to the engine
    delete options.regex;

    var engine = utils.engine(options);
    if (!utils.regex.test(str)) {
      return data[str] || str;
    }

    try {
      var val = engine.render(str, data, options);
      if (val === str) return val;
      return render(val, data, options);
    } catch(err) {
      return console.error(err);
    }
  }

  return resolve;
}

/**
 * Expose `expand`
 * @type {Function}
 */

module.exports = expand;
