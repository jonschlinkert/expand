'use strict';

/* deps: mocha */
var assert = require('assert');
var expand = require('./');

describe('expand', function() {
  it('should expand values in a string.', function() {
    var one = {a: {b: {c: 'd'}}};
    var two = {foo: '<%= a.b.c %>'};
    assert.deepEqual(expand(two, one).foo, 'd');
  });

  it('should process templates in a value.', function() {
    var one = {a: {c: '<%= d %>'}, d: {f: 'g'}};
    assert.deepEqual(expand(one).a.c, {f: 'g'});
  });

  it('should process multiple templates in a value.', function() {
    var one = {a: {c: '<%= d %>/<%= e %>'}, d: 'ddd', e: 'eee'};
    assert.deepEqual(expand(one).a.c, 'ddd/eee');
  });

  it('should process multiple templates in a string.', function() {
    var str = '<%= a %>/<%= b %>';
    assert.deepEqual(expand(str, {a: 'foo', b: 'bar'}), 'foo/bar');
  });

  it('should call helpers in templates:', function() {
    var ctx = {foo: 'bar', c: {d: {e: function (str) {
      return str.toUpperCase();
    }}}};
    assert.deepEqual(expand('abc <%= c.d.e(foo) %> xyz', ctx), 'abc BAR xyz');
  });

  it('should use custom regex.', function() {
    var one = {a: {c: ':d/:e'}, d: 'ddd', e: 'eee'};
    assert.deepEqual(expand(one, one, {regex: /:([^:\/.]+)/g}).a.c, 'ddd/eee');
  });

  it('should use functions with custom regex.', function() {
    var one = {a: {c: ':d/:e/:upper(f)'}, d: 'ddd', e: 'eee', f: 'foo', upper: function (str) {
      return str.toUpperCase();
    }};
    assert.deepEqual(expand(one, one, {regex: /:([^:\/.]+)(?:\((.*)\))?/g}).a.c, 'ddd/eee/FOO');
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

    assert.deepEqual(actual, [{foo: [3, 4, 5, "bar => 1"] }, {f: 6 }, {g: 7 }]);
  });
});
