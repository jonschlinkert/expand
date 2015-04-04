{ options: { one: 'one', two: 'two' },
  src: 
   { pages: 'templates/pages',
     partials: 'templates/partials',
     layouts: 'templates/layouts',
     data: 'data' },
  a: 
   { options: { engine: 'handlebars' },
     foo: 
      { options: 
         { layout: 'templates/layouts/layout-docs.hbs',
           partials: 'templates/partials',
           data: [ 'data/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ 'templates/pages/docs/*.hbs' ] } },
     bar: 
      { options: 
         { layout: 'templates/layouts/layout-docs.hbs',
           partials: 'templates/partials',
           data: [ 'data/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ 'templates/pages/docs/*.hbs' ] } },
     baz: 
      { options: 
         { layout: 'templates/layouts/layout-docs.hbs',
           partials: 'templates/partials',
           data: [ 'data/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ 'templates/pages/docs/*.hbs' ] } } },
  b: 
   { options: { engine: 'lodash' },
     bar: 
      { options: 
         { layout: 'templates/layouts/layout-docs.hbs',
           partials: 'templates/partials',
           data: [ 'data/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ 'templates/pages/docs/*.hbs' ] } } },
  c: 
   { options: { engine: 'swig' },
     baz: 
      { options: 
         { layout: 'templates/layouts/layout-docs.hbs',
           partials: 'templates/partials',
           data: [ 'data/*.json' ],
           assets: 'docs/assets' },
        files: { 'docs/': [ 'templates/pages/docs/*.hbs' ] } } } }
