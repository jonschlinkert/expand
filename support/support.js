'use strict';

var fs = require('fs');

function examples(fp) {
  var str = fs.readFileSync(fp, 'utf8');
  var lines = str.split('\n');
  var current, res = {};
  var len = lines.length, i = -1;
  var heading;

  while (++i < len) {
    var line = lines[i];
    var prev = lines[i - 1] || '';
    var next = lines[i + 1] || '';

    if (line.slice(0, 2) === '//' && /^[\w\/]/.test(next)) {
      var description = line.slice(3);
      current = res[description] = [];
      heading = i;
    }

    if (current && i !== heading) {
      current.push(line);
    }
  }

  var md = '\n';

  for (var key in res) {
    md += '\n';
    md += key ? ('### ' + key) : '';
    md += '\n\n';
    md += '```js\n';
    md += res[key].join('\n');
    md += '```\n'
  }
  return md.trim();
}

// quick and dirty...
// just run `node support > examples.md`
console.log(examples('examples.js'));
