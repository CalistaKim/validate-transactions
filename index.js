const fs = require("fs");
const helpers = require("./helpers");

fs.readFile("./input.txt", (err, data) => {
  if (err) throw err;
  const sourceData = JSON.parse(
    "[" + data.toString().replace(/(\n)/g, ",\n") + "]"
  );
  const output = helpers.handleLoadRequestWrapper(sourceData);
  submitLoadResponses(output);
});

function submitLoadResponses(output) {
  var file = fs.createWriteStream("loadResponses.txt");
  file.on("error", function(err) {
    console.log(err);
  });
  output.forEach(loadRes => {
    file.write(JSON.stringify(loadRes) + "\n");
  });
  file.end();
}
