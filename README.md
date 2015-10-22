# expand [![NPM version](https://badge.fury.io/js/expand.svg)](http://badge.fury.io/js/expand)  [![Build Status](https://travis-ci.org/jonschlinkert/expand.svg)](https://travis-ci.org/jonschlinkert/expand)

> Recursively resolve templates in an object, string or array.

## Heads up!

**v0.2.0 API changes**

The top-level export now returns a function that takes an options object, which then returns the function to use.

```js
var expand = require('expand');
var resolve = expand({regex: /:(\w+)/});

resolve(':a/:b', {a: 'foo', b: 'bar'});
//=> 'foo/bar'
```

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i expand --save
```

## Usage

```js
var expand = require('expand')();
expand({a: '<%= b %>', b: 'c'});
//=> {a: 'c', b: 'c'}

expand({a: '<%= b.c.d %>', b: {c: {d: 'eee'}}});
//=> {a: 'eee', b: {c: {d: 'eee' }}}
```

**Params**

```js
expand(valueToExpand, dataToUse, options);
```

* `value` **{String|Array|Object}**: The value with templates to resolve.
* `data` **{Object}**: Pass the data to use for resolving templates. If the first argument is an object, this is optional.
* `options` **{Object}**: Pass the regex to use for matching templates.
* `returns` **{any}**: Returns a string, object or array based on what was passed.

**Example**

If an object is passed, only the first argument is strictly _necessary_.

```js
expand({a: '<%= b %>', b: '<%= c %>', c: 'It worked!'});
//=> {a: 'It worked!', b: 'It worked!', c: 'It worked!'}
```

## More examples

### process templates in objects

```js
expand({a: {c: '<%= d %>'}, d: {f: 'g'}});
//=>  {a: {c: {f: 'g'}}, d: {f: 'g'}};
```

### process a template in an array

```js
expand(['<%= a %>'], {a: 'b'});
//=> ['b']
```

### process templates in a string

```js
expand('<%= a %>', {a: 'b'});
//=> 'b'
```

### process multiple templates in an array

```js
expand(['<%= a %>', '<%= b %>'], {a: 'b', b: 'c'});
//=> ['b', 'c']
```

### expand nested templates in an object

```js
var data = {a: {b: {c: 'd'}}};
expand({foo: '<%= a.b.c %>'}, data);
//=> {foo: 'd'}
```

### recursively expand templates

```js
var data = {a: '<%= b %>', b: '<%= c %>', c: 'the end!'};
expand('<%= a %>', data);
//=> 'the end!'
```

### process multiple templates in the same string

```js
var str = '<%= a %>/<%= b %>';
expand(str, {a: 'foo', b: 'bar'});
//=> 'foo/bar'
```

### process multiple templates in an object value

```js
var data = {
  a: {
    c: '<%= d %>/<%= e %>'
  },
  d: 'ddd',
  e: 'eee'
};
expand(data).a.c;
//=> 'ddd/eee'
```

### recursively process templates in object values

```js
var data = {
  a: '<%= b %>/<%= c %>',
  b: 'xxx',
  c: '<%= y %>',
  y: 'zzz'
};
expand('<%= a %>', data);
//=> 'xxx/zzz'
```

### call helpers in templates

```js
var ctx = {
  foo: 'bar',
  c: {
    d: {
      e: function (str) {
        return str.toUpperCase();
      }
    }
  }
};
expand('abc <%= c.d.e(foo) %> xyz', ctx);
//=> 'abc BAR xyz'
```

### use custom regex

Options may be passed as the third argument. Currently `options.regex` is the only option.

```js
var data = {a: 'bbb', c: 'ddd', e: 'fff'};
expand({foo: ':c/:e'}, data, {regex: /:([(\w ),]+)/});
//=> {foo: 'ddd/fff'}
```

### call functions with custom regex.

```js
var data = {
  a: {c: ':d/:e/:upper(f)'},
  d: 'ddd',
  e: 'eee',
  f: 'foo',
  upper: function (str) {
    return str.toUpperCase();
  }
};

var result = expand(data, data, {regex: /:([(\w ),]+)/});
console.log(result.a.c);
//=> 'ddd/eee/FOO'
```

## Related projects

* [engine](https://www.npmjs.com/package/engine): Template engine based on Lo-Dash template, but adds features like the ability to register helpers… [more](https://www.npmjs.com/package/engine) | [homepage](https://github.com/jonschlinkert/engine)
* [expand-object](https://www.npmjs.com/package/expand-object): Expand a string into a JavaScript object using a simple notation. Use the CLI or… [more](https://www.npmjs.com/package/expand-object) | [homepage](https://github.com/jonschlinkert/expand-object)
* [get-value](https://www.npmjs.com/package/get-value): Use property paths (`  a.b.c`) to get a nested value from an object. | [homepage](https://github.com/jonschlinkert/get-value)
* [glob-object](https://www.npmjs.com/package/glob-object): Filter an object using glob patterns and dot notation. | [homepage](https://github.com/jonschlinkert/glob-object)
* [set-value](https://www.npmjs.com/package/set-value): Create nested values and any intermediaries using dot notation (`'a.b.c'`) paths. | [homepage](https://github.com/jonschlinkert/set-value)

## Alternatives

Here are some great libs by other authors. My needs for expand differed enough to create a new library, but these are definitely worth a look:

* [expander](https://www.npmjs.com/package/expander): Expand template strings in declarative configurations. | [homepage](https://github.com/tkellen/expander)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/expand/issues/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 21, 2015._