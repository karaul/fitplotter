import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var FitParser = require('fit-parser.cjs').default;
var fs = require('fs');

var file = process.argv[2] || './example.fit';

fs.readFile(file, function (err, content) {
  var fitParser = new FitParser(/* {
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  } */);

  fitParser.parse(content, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      //console.log(JSON.stringify(data));
      console.log(data.records[0]);
    }
  });
});
