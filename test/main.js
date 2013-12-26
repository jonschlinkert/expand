/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2013 Upstage.
 * Licensed under the MIT License (MIT).
 */


// Node.js
var inspect = require('util').inspect;

// node_modules
var _ = require('lodash');

// Test lib
var assert = require('chai').assert;
var expect = require('chai').expect;

// Local utils
var expand = require('../');

var simpleObj = {
  a: 'foo',
  b: 'bar',
  c: '<%= a %><%= b %>'
};

var obj = {
  a: 1,
  b: 2,
  c: {
    d: [3, 4, 5, 'bar => <%= a %>'],
    e: [{ foo: '<%= c.d %>' }, {f: 6}, {g: 7}]
  },
  fn: '<%= _.extend({z: 0}, {z: 42}, {z: c.d}, 1, "a", \'a\') %>'
};

var complexObj = {
};

describe('expand', function() {

  describe('process', function() {
    it('should expand lodash templates', function() {
      var expected = {a:1,b:2,c:{d:[3,4,5,'bar => 1'],e:[{foo:[3,4,5,'bar => 1']},{'f':6},{'g':7}]},'fn':{'z':[3,4,5,'bar => 1']}};
      var actual = expand.process(obj);
      expect(actual).to.eql(expected);
    });
  });

  describe('get', function() {
    it('should process nested templates recursively', function() {
      var expected = [{foo:[3,4,5,"bar => 1"]},{f:6},{g:7}];
      var actual = expand.get(obj, 'c.e');
      expect(actual).to.eql(expected);
    });
  });

  describe('getRaw', function() {
    it('should get the raw value at the given path', function() {
      var expected = [{ foo: '<%= c.d %>' }, {f: 6}, {g: 7}];
      var actual = expand.getRaw(obj, 'c.e');
      expect(actual).to.eql(expected);
    });
  });

  describe('set', function() {
    it('should set a value on the config object.', function() {
      // I'm curious about how this works, I would have expected one of the following to be equal
      // var expected = {x:{y:{z:'quux'}}};
      // var expected = simpleObj.x.y.z;

      var expected = 'quux';
      var actual = expand.set(simpleObj, 'x.y.z', 'quux');
      expect(actual).to.eql(expected);
    });
  });

  describe('setRaw', function() {
  
    it('should set the raw value at the given path', function() {
      var expected = '<%= a %>';
      var actual = expand.setRaw(simpleObj, 'x.y.z', '<%= a %>');
      expect(actual).to.eql(expected);
    });
  
  });

});

