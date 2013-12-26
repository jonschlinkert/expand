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
  fn: '<% _.extend({z: 0}, {z: 42}, {z: c.d}, 1, "a", \'a\') %>'
};

var complexObj = {
  arr: ['foo', '<%= obj.foo2 %>'],
  arr2: ['<%= arr %>', '<%= obj.Arr %>'],
  bar: 'bar',
  bar2: data.readData('package.json'),
  baz: ['<%= bar %>'],
  config: {
    one: ['./test/fixtures/one.json', './fixtures/tasks.json'],
    two: './test/fixtures/two.yml',
    three: './test/fixtures/three.json',
    four: './fixtures/tasks.json',
    pkg: data.readData('package.json'),
    qux: data.readData('./test/fixtures/one.json')
  },
  foo: '<%= meta.foo %>',
  foo2: '<%= foo %>',
  foo3: 'package.json',
  meta: data.readData('./test/fixtures/test.json'),
  meta2: {
    foo: 'bar'
  },
  obj: {
    foo: '<%= meta.foo %>',
    foo2: '<%= obj.foo %>',
    Arr: ['foo', '<%= obj.foo2 %>'],
    arr2: ['<%= arr %>', '<%= obj.Arr %>'],
  },
  pkg: 'package.json',
  qux: data.readData('./test/fixtures/one.json'),

  metadata: {
    one: ['docs/tasks.json'],
    two: ['<%= pkg %>', '<%= qux %>', 'docs/tasks.json'],
    three: ['<%= config.pkg %>', '<%= config.qux %>', 'docs/tasks.json'],
    four: ['<%= pkg %>', {foo: 'bar'}, 'docs/tasks.json'],
    five: ['<%= pkg %>', 'test/fixtures/data/*.{json,yml}', 'docs/tasks.json'],
    six: '<%= config.one %>',
    seven: 'docs/tasks.json',
    eight: '<%= config.four %>',
    nine: ['test/fixtures/data/one.json', 'test/fixtures/data/two.yml'],
    ten: ['test/fixtures/data/two.yml', {description: 'Foo', name: 'Bar'}, '<%= pkg %>', 'test/fixtures/data/*.json', {alpha: 1, beta: 2 }, {kappa: 3, gamma: 4 }, {zed: {orange: 5, apple: 6 } }, '<%= config.one %>', {name: 'New'}, {quux: '<%= qux %>'}, ['one', {pkg: '<%= config.pkg %>'}, 'three'], {arr: ['one', 'two', 'three']}],
    eleven: ['<%= config.one %>', '<%= config.two %>'],
    twelve: 'test/fixtures/data/*.{json,yml}',
    thirteen: ['test/fixtures/data/*.{json,yml}'],
    fourteen: ['test/fixtures/data/*.json', 'test/fixtures/data/*.yml'],
    fifteen: ['test/fixtures/data/*.json', '<%= config.two %>'],
    sixteen: {
      description: 'Foo',
      name: 'Bar'
    }
  }
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
      var actual = expand.get(obj, 'c.e'));
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

});

