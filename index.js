'use strict';

var set = require('set-object');
var _ = require('lodash');

function process(context, fn) {
  return function(str, key) {
    if (typeof fn === 'function') {
      return fn(key, str, context);
    }
    return _.template(str, context);
  }
}

module.exports = function expand(target, context, fn) {
  var res = process(context, fn);
  var o = {};

  if (typeof target === 'string') {
    return res(target);
  }

  if (Array.isArray(target)) {
    return target.map(res);
  }

  if (typeof target === 'object') {
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] === 'string') {
          o[key] = res(target[key], key);
        } else if (typeof target[key] === 'object') {
          o[key] = expand(target[key], context);
        } else {
          o[key] = target[key];
        }
      }
    }
    return o;
  }
};
