# expand [![NPM version](https://badge.fury.io/js/expand.svg)](http://badge.fury.io/js/expand)  [![Build Status](https://travis-ci.org/jonschlinkert/expand.svg)](https://travis-ci.org/jonschlinkert/expand)

> Recursively resolve templates in an object, string or array.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i expand --save
```

## Usage

```js
var expand = require('expand');
expand({a: '<%= b %>', b: 'FOO'});
//=> {a: 'FOO', b: 'FOO'}
```

### [expand](index.js#L25)

Resolve templates in the given string, array or object.

**Params**

* `value` **{String|Array|Object}**: The value with templates to resolve.
* `data` **{Object}**
* `options` **{Object}**
* `returns` **{any}**: Returns a string, object or array.

**Example**

```js
expand({a: '<%= b %>', b: 'FOO'});
//=> {a: 'FOO', b: 'FOO'}
```
