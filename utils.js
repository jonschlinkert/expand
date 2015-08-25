'use strict';

/**
 * Expose lazily required module dependecies as `utils` methods
 */

module.exports = function (fn) {
  var lazy = require('lazy-cache')(fn);
  lazy('kind-of', 'typeOf');
  lazy('is-primitive', 'isPrimitive');
  lazy('get-value', 'get');
  lazy('engine');
  return lazy;
};
