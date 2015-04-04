var util = require('util');
var expand = require('./');
var config = require('./test/fixtures/config');
var data = require('./test/fixtures/data');
var expander = require('expander');

// var res = expander.process(config, config);
var res = expand(config, config);
// var res = expand(data, data);
// res = expand(res, res)
console.log(util.inspect(res, null, 10))
