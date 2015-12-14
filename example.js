'use strict';

var expand = require('./');
var fixture = {
  deps: {
    a: '',
    b: '',
    c: '',
  },
  foo: '<%= Object.keys(deps) %>'
};

expand()(fixture)
