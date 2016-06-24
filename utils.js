'use strict';

var cache = {};
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('get-value');
require('is-primitive', 'isPrimitive');
require('kind-of', 'typeOf');
require('get-value', 'get');
require('regex-flags');
require('engine');
require = fn;

/**
 * Get the regex from `engine/utils`
 */

utils.regex = utils.engine.utils.delimiters;

/**
 * Create a valid regex. Strips the `g` flag
 * to ensure we have the index we want.
 */

utils.createRegex = function createRegex(opts) {
  var regex = utils.regex;
  if (utils.typeOf(opts.regex) === 'regexp') {
    regex = opts.regex;
  }

  var str = regex.source;
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }

  var flags = utils.regexFlags(regex);
  if (flags && flags.indexOf('g') > -1) {
    flags = flags.split('').filter(function(flag) {
      return flag !== 'g';
    }).join('');
  }
  var re = new RegExp(str, flags);
  return (cache[str] = re);
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
