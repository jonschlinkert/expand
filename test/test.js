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
var expand = require('..');

describe('expand', function() {
  it('should expand values in a string.', function() {
    var one = {a: {b: {c: 'd'}}};
    var two = {foo: '<%= a.b.c %>'};
    expand(two, one).foo.should.equal('d');
  });

  it('should process templates in a value.', function() {
    var one = {a: {c: '<%= d %>'}, d: {f: 'g'}};
    expand(one).a.c.should.eql({f: 'g'});
  });

  it.only('should process multiple templates in a string.', function() {
    var str = '<%= a %>/<%= b %>';
    expand(str, {a: 'foo', b: 'bar'}).should.equal('foo/bar');
  });

  it('should call helpers in templates:', function() {
    var ctx = {foo: 'bar', c: {d: {e: function (str) {
      return str.toUpperCase();
    }}}};
    expand('abc <%= c.d.e(foo) %> xyz', ctx).should.eql('abc BAR xyz');
  });

  it('should process nested templates recursively', function() {
    var actual = expand('<%= c.e %>', {
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
    });

    actual.should.eql([{foo: [3, 4, 5, "bar => 1"] }, {f: 6 }, {g: 7 }]);
  });
});
