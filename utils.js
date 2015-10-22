'use strict';

var cache = {};

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

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

/**
 * Restore `require`
 */

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
    flags = flags.split('').filter(function (flag) {
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
