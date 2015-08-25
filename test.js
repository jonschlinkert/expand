'use strict';

/* deps: mocha */
var util = require('util');
var assert = require('assert');
var expand = require('./');

var inspect = function (obj) {
  return util.inspect(obj, null, 10);
};

describe('expand', function() {
  it('should expand values in a string.', function() {
    assert.strictEqual(expand('<%= a %>', {a: 'b'}), 'b');
  });

  it('should process templates in an object value.', function() {
    var one = {a: {c: '<%= d %>'}, d: {f: 'g'}};
    assert.deepEqual(expand(one).a.c, {f: 'g'});
  });

  it('should process a template in an array.', function() {
    assert.deepEqual(expand(['<%= a %>'], {a: 'b'}), ['b']);
  });

  it('should process multiple templates in an array.', function() {
    assert.deepEqual(expand(['<%= a %>', '<%= b %>'], {a: 'b', b: 'c'}), ['b', 'c']);
  });

  it('should expand nested templates in an object.', function() {
    var one = {a: {b: {c: 'd'}}};
    var two = {foo: '<%= a.b.c %>'};
    assert.deepEqual(expand(two, one).foo, 'd');
  });

  it('should recursively expand templates.', function() {
    var data = {a: '<%= b %>', b: '<%= c %>', c: 'the end!'};
    assert.deepEqual(expand('<%= a %>', data), 'the end!');
  });

  it('should process multiple templates in a string.', function() {
    var str = '<%= a %>/<%= b %>';
    assert.deepEqual(expand(str, {a: 'foo', b: 'bar'}), 'foo/bar');
  });

  it('should process multiple templates in a single property value.', function() {
    var one = {a: {c: '<%= d %>/<%= e %>'}, d: 'ddd', e: 'eee'};
    assert.deepEqual(expand(one).a.c, 'ddd/eee');
  });

  it('should recursively process multiple templates in a single value.', function() {
    var data = {a: '<%= b %>/<%= c %>', b: 'xxx', c: '<%= y %>', y: 'zzz'};
    assert.deepEqual(expand('<%= a %>', data), 'xxx/zzz');
  });

  it('should call helpers in templates:', function() {
    var ctx = {foo: 'bar', c: {d: {e: function (str) {
      return str.toUpperCase();
    }}}};
    assert.deepEqual(expand('abc <%= c.d.e(foo) %> xyz', ctx), 'abc BAR xyz');
  });

  it('should use custom regex.', function() {
    var one = {a: {c: ':d/:e'}, d: 'ddd', e: 'eee'};
    assert.deepEqual(expand(one, one, {regex: /:([(\w ),]+)/}).a.c, 'ddd/eee');
  });

  it('should call functions with custom regex.', function () {
    var one = {
      a: {c: ':d/:e/:upper(f)'},
      d: 'ddd',
      e: 'eee',
      f: 'foo',
      upper: function (str) {
        return str.toUpperCase();
      }
    };
    var actual = expand(one, one, {
      regex: /:([(\w ),]+)/
    });
    assert.deepEqual(actual.a.c, 'ddd/eee/FOO');
  });

  it('should process nested templates recursively', function() {
    var actual = expand('<%= c.e %>', {
      a: 1,
      b: 2,
      c: {
        d: [3, 4, 5, 'bar => <%= a %>'],
        e: [{foo: '<%= c.d %>'}, {f: 6 }, {g: 7 }]
      },
    });
    assert.deepEqual(actual, [{foo: [3, 4, 5, "bar => 1"] }, {f: 6 }, {g: 7 }]);
  });
});
