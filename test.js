'use strict';

var assert = require('assert');
var parse = require('parse-filepath');
var extend = require('extend-shallow');
var resolve = require('./');
var expand;

describe('expand', function() {
  beforeEach(function() {
    expand = resolve();
  });

  it('should expand values in a string.', function() {
    assert.strictEqual(expand('<%= a %>', {a: 'b'}), 'b');
  });

  it('should work with dot notation.', function() {
    assert.strictEqual(expand('<%= a.b %>', {a: {b: 'c'}}), 'c');
    assert.strictEqual(expand('<%= a.html %>', {a: 'b'}), 'b.html');
    assert.strictEqual(expand('<%= a.min.js %>', {a: 'b'}), 'b.min.js');
    assert.equal(expand('<%= a.b.c.html %>', {a: {b: {c: 'd'}}}), 'd.html');
    assert.equal(expand('<%= a.b.c.min.js %>', {a: {b: {c: 'd'}}}), 'd.min.js');
  });

  it('should return `match` if dot notation values are not all strings.', function() {
    assert.strictEqual(expand('<%= a.html %>', {a: {b: 'c'}}), '<%= a.html %>');
  });

  it('should process templates in an object value.', function() {
    var one = {a: {c: '<%= d %>'}, d: {f: 'g'}};
    assert.deepEqual(expand(one).a.c, {f: 'g'});
  });

  it('should process a template in an array.', function() {
    assert.deepEqual(expand(['<%= a %>'], {a: 'b'}), ['b']);
  });

  it('should return unprocessed templates.', function() {
    assert.deepEqual(expand(['<%= a %>'], {}), ['<%= a %>']);
  });

  it('should process multiple templates in an array.', function() {
    assert.deepEqual(expand(['<%= a %>', '<%= b %>'], {a: 'b', b: 'c'}), ['b', 'c']);
  });

  it('should expand nested templates in an object.', function() {
    var one = {a: {b: {c: 'd'}}};
    var two = {foo: '<%= a.b.c %>'};
    assert.deepEqual(expand(two, one).foo, 'd');
  });

  it('should return a function bound to the context.', function() {
    var ctx = {
      word: 'foo',
      addFoo: function(str) {
        return str + this.word;
      }
    };

    var two = {
      foo: '<%= addFoo %>'
    };

    assert.equal(expand(two, ctx).foo('bar'), 'barfoo');
  });

  it('should recursively expand templates.', function() {
    var data = {a: '<%= b %>', b: '<%= c %>', c: 'the end!'};
    assert.deepEqual(expand('<%= a %>', data), 'the end!');
  });

  it('should process multiple templates in a string.', function() {
    var str = '<%= a %>/<%= b %>';
    assert.deepEqual(expand(str, {a: 'foo', b: 'bar'}), 'foo/bar');
  });

  it('should process multiple functions in a string.', function() {
    var str = '<%= a() %>/<%= b() %>';
    var ctx = {
      a: function() {
        return 'aaa';
      },
      b: function() {
        return 'bbb';
      }
    };
    assert.deepEqual(expand(str, ctx), 'aaa/bbb');
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
    var ctx = {foo: 'bar', c: {d: {e: function(str) {
      return str.toUpperCase();
    }}}};
    assert.deepEqual(expand('abc <%= c.d.e(foo) %> xyz', ctx), 'abc BAR xyz');
  });

  it('should use custom regex.', function() {
    var one = {a: {c: ':d/:e'}, d: 'ddd', e: 'eee'};
    expand = resolve({regex: /:([(\w ),.]+)/});
    assert.equal(expand(one).a.c, 'ddd/eee');
    assert.equal(expand('foo/:a.b.c.html', {a: {b: {c: 'd'}}}), 'foo/d.html');
  });

  it('should work with native javascript methods', function() {
    var fixture = {
      deps: {a: '', b: '', c: ''}, foo: '<%= Object.keys(deps) %>'
    };

    expand = resolve();
    assert.deepEqual(expand(fixture), {
      deps: { a: '', b: '', c: '' },
      foo: [ 'a', 'b', 'c' ]
    });

    fixture.deps.a = 'aaa';
    fixture.bar = '<%= (deps.a).toUpperCase() %>';

    assert.deepEqual(expand(fixture), {
      deps: { a: 'aaa', b: '', c: '' },
      foo: [ 'a', 'b', 'c' ],
      bar: 'AAA'
    });

    fixture.baz = '<%= bar.split("") %>';
    assert.deepEqual(expand(fixture), {
      deps: { a: 'aaa', b: '', c: '' },
      foo: [ 'a', 'b', 'c' ],
      bar: 'AAA',
      baz: ['A', 'A', 'A']
    });

    fixture.fez = 'a <%= bar.split("") %> b';
    assert.deepEqual(expand(fixture), {
      deps: { a: 'aaa', b: '', c: '' },
      foo: [ 'a', 'b', 'c' ],
      bar: 'AAA',
      baz: ['A', 'A', 'A'],
      fez: 'a A,A,A b'
    });

    fixture.qux = '<%= bar.split("").join("-") %>';
    assert.deepEqual(expand(fixture), {
      deps: { a: 'aaa', b: '', c: '' },
      foo: [ 'a', 'b', 'c' ],
      bar: 'AAA',
      baz: ['A', 'A', 'A'],
      fez: 'a A,A,A b',
      qux: 'A-A-A'
    });
  });

  it('should work with complex expressions', function() {
    var fixture = {
      deps: {a: '', b: '', c: ''}, foo: '<%= Object.keys(deps).map(function(str) {return str.toUpperCase()}) %>'
    };

    expand = resolve();
    assert.deepEqual(expand(fixture), {
      deps: { a: '', b: '', c: '' },
      foo: [ 'A', 'B', 'C' ]
    });
  });

  it('should work with nested expressions and helpers', function() {
    var fixture = {
      upper: function(keys) {
        return keys.map(function(key) {
          return key.toUpperCase();
        });
      },
      deps: {a: '', b: '', c: ''}, foo: '<%= upper(Object.keys(deps)) %>'
    };
    expand = resolve();
    assert.deepEqual(expand(fixture), {
      deps: { a: '', b: '', c: '' },
      foo: [ 'A', 'B', 'C' ],
      upper: fixture.upper
    });
  });

  it('should use custom regex with a file extension in the pattern', function() {
    var data = {dir: 'dist', a: 'A', b: 'B', c: 'C'};
    data = extend({}, data, parse('dist/index.hbs'));
    expand = resolve({regex: /:([(\w ),.]+)/});
    var res = expand(':dir/:name.:a:b:c', data);
    assert.equal(res, 'dist/index.ABC');
  });

  it('should call functions with custom regex.', function() {
    expand = resolve({regex: /:([(\w ),]+)/ });
    var one = {
      a: {c: ':d/:e/:upper(f)'},
      d: 'ddd',
      e: 'eee',
      f: 'foo',
      upper: function(str) {
        return str.toUpperCase();
      }
    };
    var actual = expand(one);
    assert.deepEqual(actual.a.c, 'ddd/eee/FOO');
  });

  it('should process boolean in data.', function() {
    assert.strictEqual(expand('<%= a %> <%= b %>', {a: false, b: true}), 'false true');
  });

  it('should process nested templates recursively', function() {
    var actual = expand('<%= c.e %>', {
      a: 1,
      b: 2,
      c: {
        d: [3, 4, 5, 'bar => <%= a %>'],
        e: [{foo: '<%= c.d %>'}, {f: 6 }, {g: 7 }]
      }
    });
    assert.deepEqual(actual, [{foo: [3, 4, 5, 'bar => 1'] }, {f: 6 }, {g: 7 }]);
  });

  it('should process other template on first failure.', function() {
    assert.strictEqual(expand('<%= c %>:<%= a %>', {a: 'b'}), '<%= c %>:b');
  });

  it('should return value from helpers when value is a key on the context.', function() {
    assert.strictEqual(expand('<%= a() %><%= b() %><%= c() %>', {
      a: function() { return this.d; },
      b: function() { return this.e; },
      c: function() { return this.f; },
      d: 'x',
      e: 'y',
      f: 'z',
      x: 'a',
      y: 'b',
      z: 'c'
    }), 'xyz');
  });

  it('should be able to pass values into helpers.', function() {
    assert.strictEqual(expand('<%= a(d) %><%= b(e) %><%= c(f) %>', {
      a: function(prop) { return prop; },
      b: function(prop) { return prop; },
      c: function(prop) { return prop; },
      d: 'x',
      e: 'y',
      f: 'z',
      x: 'a',
      y: 'b',
      z: 'c'
    }), 'xyz');
  });

  it('should be able to pass values into helpers and use `this` inside helpers.', function() {
    assert.strictEqual(expand('<%= a(d) %><%= b(e) %><%= c(f) %>', {
      a: function(prop) { return this[prop]; },
      b: function(prop) { return this[prop]; },
      c: function(prop) { return this[prop]; },
      d: 'x',
      e: 'y',
      f: 'z',
      x: 'a',
      y: 'b',
      z: 'c'
    }), 'abc');
  });
});

describe('options', function() {
  describe('silent', function() {
    it('should throw an error when a function value cannot be resolved.', function() {
      expand = resolve();
      var str = '<%= whatever() %>';
      var ctx = {};
      var num = 0;
      try {
        expand(str, ctx);
      } catch (err) {
        num++;
        assert.equal(err.message, 'whatever is not defined');
      }
      assert.equal(num, 1);
    });

    it('should silence errors when a function value cannot be resolved.', function() {
      expand = resolve({silent: true});
      var str = '<%= whatever() %>';
      var ctx = {};

      var res = expand(str, ctx);
      assert.equal(res, str);
    });
  });
});
