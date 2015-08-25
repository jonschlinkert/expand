```js
expand({a: '<%= b %>', b: '<%= c %>', c: 'It worked!'});
//=>  a: 'It worked!', b: 'It worked!', c: 'It worked!' }
```

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

```js
// Options may be passed as the third argument. Currently `options.regex` is the only option.

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
