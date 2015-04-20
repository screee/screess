/// <reference path="../definitions/index.d.ts" />
var CLI = require('commander');
var Fs = require('fs');
var Path = require('path');
var ChildProcess = require('child_process');
var assert = require('assert');
var Parser = require('../source/parser');
var Package = require('../package.json');
var Linter = require('mapbox-gl-style-lint');
var ENCODING = "utf8";
CLI.version(Package.version);
CLI.usage('[<input-screess>=stdin [<output-json>=stdout]]');
CLI.option('-p, --preview', 'Open the stylesheet in the mapbox-gl-native viewer (OSX Only)');
CLI.option('-w, --watch', 'Monitor the source file for changes and automatically recompile');
CLI.parse(process.argv);
compile();
if (CLI['watch']) {
    assert(CLI.args[0]);
    Fs.watchFile(CLI.args[0], { interval: 100 }, function () {
        compile();
    });
}
function preview(style) {
    var command1 = 'env ' + 'MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibHVjYXN3b2oiLCJhIjoiNWtUX3JhdyJ9.WtCTtw6n20XV2DwwJHkGqQ ' + 'open ' + '--background ' + 'mapboxgl://?style=' + Path.resolve(style);
    console.log("Refreshing preview");
    var child1 = ChildProcess.exec(command1, function (error, stdout, stderr) {
    });
}
function compile() {
    console.log("\n\nStarting compilation");
    var inputStream = CLI.args[0] ? Fs.createReadStream(CLI.args[0]) : process.stdin;
    var outputStream = CLI.args[1] ? Fs.createWriteStream(CLI.args[1]) : process.stdout;
    inputStream.setEncoding(ENCODING);
    inputStream.on("error", function (error) {
        throw error;
    });
    outputStream.on("error", function (error) {
        throw error;
    });
    var input = "";
    inputStream.on("data", function (chunk) {
        input += chunk;
    });
    inputStream.on("end", function () {
        try {
            var output = JSON.stringify(Parser.parse(input), null, 2) + "\n";
            Linter.validate(output);
            if (outputStream == process.stdout) {
                outputStream.write(output, ENCODING);
            }
            else {
                outputStream.end(output, ENCODING);
            }
            assert(CLI.args[1]);
            if (CLI['preview'])
                preview(CLI.args[1]);
            console.log("Done compilation");
        }
        catch (e) {
            console.log(e.toString());
            console.log(e.stack);
        }
    });
}
//# sourceMappingURL=CLI.js.map