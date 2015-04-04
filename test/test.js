/*!
 * expand <https://github.com/jonschlinkert/expand>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var util = require('util');
var assert = require('assert');
var set = require('set-value');
var expand = require('..');

describe('expand', function() {
  it('should expand values in a string.', function() {
    var one = {'a.b': {c: 'd'}};
    var two = {'a.b.c': 'd'};
    expand(one).a.b.should.have.property('c');
    expand(two).a.b.should.have.property('c');
  });

  it('should process templates.', function() {
    var one = {'a.b': {c: '<%= d %>'}, d: {f: 'g'}};
    expand(one).a.b.should.eql({c: {f: 'g'}});
  });

  it('should use a custom function to resolve values:', function() {
    var ctx = {a: 'one', b: 'two', c: {d: {e: 'f'}}};
    var actual = expand({'c.d.e': 'abc <%= a %> xyz'}, ctx);
    actual.should.eql({c: {d: {e: 'abc one xyz'}}});
  });

  it('should process nested templates recursively', function() {
    var actual = expand('c.e', {
      a: 1,
      b: 2,
      c: {
        d: [3, 4, 5, 'bar => <%= a %>'],
        e: [{
          foo: '<%= c.d %>'
        }, {
          f: 6
        }, {
          g: 7
        }]
      },
      // fn: '<%= _.extend({z: 0}, {z: 42}, {z: c.d}, 1, "a", \'a\') %>'
    });
    console.log(actual)
    // actual.should.eql([{
    //   foo: [3, 4, 5, "bar => 1"]
    // }, {
    //   f: 6
    // }, {
    //   g: 7
    // }]);
  });

});
