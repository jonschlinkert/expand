'use strict';

var cache = {};

/**
 * Expose lazily required module dependecies as `utils` methods
 */

module.exports = function (fn) {
  var lazy = require('lazy-cache')(fn);
  lazy('is-primitive', 'isPrimitive');
  lazy('kind-of', 'typeOf');
  lazy('get-value', 'get');
  lazy('regex-flags');
  lazy('engine');


  // TODO: un-lazy for browser build
  var utils = lazy;

  /**
   * Get the regex from `engine/utils`
   */

  utils.regex = utils.engine.utils.delimiters;

  /**
   * Trim whitespace from a string, or return an
   * empty string if undefined.
   */

  utils.trim = function trim(str) {
    return str == null ? '' : String(str).trim();
  };

  /**
   * Create a valid regex. Strips the `g` flag
   * since we recurse already.
   */

  utils.createRegex = function createRegex(opts) {
    opts = opts || {};
    var regex = utils.regex;
    if (utils.typeOf(opts.regex) === 'regexp') {
      regex = opts.regex;
    }

    var str = regex.source;
    if (cache.hasOwnProperty(str)) {
      return cache[str];
    }

    var flags = lazy.regexFlags(regex);
    if (flags && flags.indexOf('g') > -1) {
      flags = flags.split('').filter(function (flag) {
        return flag !== 'g';
      }).join('');
    }
    var re = new RegExp(str, flags);
    return (cache[str] = re);
  };
  return lazy;
};


