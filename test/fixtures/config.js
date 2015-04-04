var glob = require('glob');

module.exports = { options: { one: 'one', two: 'two' },
  upper: function (str) {
    return str.toUpperCase();
  },
  double: function (str) {
    return str + '---' + str;
  },
  glob: function (str) {
    return glob.sync(str);
  },
  src: {
    pages: 'templates/pages',
    partials: 'templates/partials',
    layouts: 'templates/layouts',
    data: 'data',
    arr1: ['a', 'b', 'c'],
    arr2: ['<%= src.arr1 %>'],
    arr3: '<%= src.arr2 %>',
    files: '[<%= glob("test/*.js") %>]',
    fn: '<%= double(upper(src.pages)) %>',
  },
  assets: '_gh_pages/assets',
  a:
   { options: { engine: 'handlebars' },
     foo:
      { options:
         { layout: '<%= src.layouts %>/layout-docs.hbs',
           partials: '<%= src.partials %>',
           data: [ '<%= src.data %>/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ '<%= src.pages %>/docs/*.hbs' ] } },
     bar:
      { options:
         { layout: '<%= src.layouts %>/layout-docs.hbs',
           partials: '<%= src.partials %>',
           data: [ '<%= src.data %>/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ '<%= src.pages %>/docs/*.hbs' ] } },
     baz:
      { options:
         { layout: '<%= src.layouts %>/layout-docs.hbs',
           partials: '<%= src.partials %>',
           data: [ '<%= src.data %>/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ '<%= src.pages %>/docs/*.hbs' ] } } },
  b:
   { options: { engine: 'lodash' },
     bar:
      { options:
         { layout: '<%= src.layouts %>/layout-docs.hbs',
           partials: '<%= src.partials %>',
           data: [ '<%= src.data %>/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ '<%= src.pages %>/docs/*.hbs' ] } } },
  c:
   { options: { engine: 'swig' },
     baz:
      { options:
         { layout: '<%= src.layouts %>/layout-docs.hbs',
           partials: '<%= src.partials %>',
           data: [ '<%= src.data %>/*.json' ],
           assets: 'docs/assets',
           assets2: 'docs/${assets}' },
        files: { 'docs/': [ '<%= src.pages %>/docs/*.hbs' ] } } } }
