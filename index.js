'use strict';

var utils = require('./utils');

function expand(options) {
  options = options || {};
  var regex = utils.createRegex(options);

  function resolve(val, data) {
    data = data || val;

    switch (utils.typeOf(val)) {
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
  function values(data, keys) {
    var len = keys.length;
    var vals = new Array(len);
    while (len--) {
      vals[len] = data[keys[len]];
    }
    return vals;
  }

  function interpolate(str) {
    return function(data) {
      var keys = Object.keys(data);
      var vals = values(data, keys);
      return Function(keys, 'return ' + str).apply(null, vals);
    };
  }

  function resolveString(str, data) {
    var m;

    while ((m = regex.exec(str))) {
      var orig = str;
      var prop = (m[1] || m[2] || '').trim();
      var match = m[0];

      if (!match) return str;
      var len = match.length;
      var val = match;
      var i = m.index;

      if (/[()]/.test(prop)) {
        try {
          val = interpolate(prop)(data);
        } catch (err) {
          prop = '<%= ' + prop + ' %>';
          val = render(prop, data, options);
        }
      } else {
        val = resolveProperty(prop, data);
      }

      // if no value was retured from `get` or `render`,
      // reset the value back to `match`
      if (typeof val === 'undefined') {
        val = match;
      }

      // if the value is an object, recurse to resolve
      // templates in the keys and values of the object
      if (typeof val === 'object') {
        val = resolve(val, data, options);

      // ensure we have a string. numbers are the most
      // likely thing to blow this up at this point
      } else if (typeof val !== 'function') {
        val = val.toString();
      }

      if (typeof val === 'function') {
        return val.bind(data);
      }

      var head = str.slice(0, i) || '';
      var tail = str.slice(i + len) || '';

      // could be an array, object, etc. if so, just
      // break and return the value. we could add one
      // more `resolve` here if there is a reason to
      if (typeof val !== 'string' && !head && !tail) {
        str = val;
        break;
      } else {
        if (tail) {
          tail = resolve(tail, data);
        }
        str = head + val + tail;
      }

      if (str === orig) break;
    }
    return str;
  }

  function resolveProperty(prop, data) {
    var dot = prop.slice(-1) === '.';
    if (dot) prop = prop.slice(0, -1);

    var val = utils.get(data, prop);
    if (dot) val += '.';
    if (typeof val !== 'undefined') {
      return val;
    }

    // if no `.`, return
    var idx = prop.indexOf('.');
    if (idx === -1) return;

    // `.` might mean it's a file extension
    // so try popping off the extension and
    // try again
    var segs = prop.split('.');
    var last = '.' + segs.pop();

    val = utils.get(data, segs.join('.'));
    if (typeof val !== 'string') {
      last = '.' + segs.pop() + last;
      val = utils.get(data, segs.join('.'));

      if (typeof val !== 'string') {
        return;
      }
    }
    return val + last;
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
    // we re-create the delims as native erb-like delims, and we
    // don't want avoid passing the custom regex to the engine
    delete options.regex;

    var engine = utils.engine(options);
    if (!utils.regex.test(str)) {
      return str;
    }

    try {
      var val = engine.render(str, data, options);
      return render(val, data, options);
    } catch (err) {
      if (options.silent === true) {
        return str;
      }
      throw err;
    }
  }
  return resolve;
}

/**
 * Expose `expand`
 * @type {Function}
 */

module.exports = expand;
