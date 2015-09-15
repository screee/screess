/// <reference path="../typescript_interfaces/index.d.ts" />

import CLI = require('commander');
import Fs = require('fs');
import Path = require('path');
import ChildProcess = require('child_process')
import assert = require('assert');
import PreviewServer = require('./server');
var Parser = require('./parser');
var Package = require('../package.json');
var MapboxGLStyleSpec = require('mapbox-gl-style-spec');
var Reload = require('reload');

var ENCODING = "utf8";

CLI.version(Package.version)
CLI.usage('[<input-screess>=stdin [<output-json>=stdout]]');
CLI.option('-p, --preview', 'Start a webserver to preview changes in GL JS');
CLI.option('-w, --watch', 'Monitor the source file for changes and automatically recompile');
CLI.parse(process.argv)

compile();

if (CLI['watch']) {
  assert(CLI.args[0])
  Fs.watchFile(CLI.args[0], {interval: 100}, () => {
    compile();
  });
}

if (CLI['preview']) {
  assert(CLI.args[1], 'You must provide an output filename with --preview');
  var server = PreviewServer(Path.resolve(CLI.args[1]));
  server.listen(3000, function () {
    console.log('Server listening at http://localhost:3000');
  });
}

function compile() {
    console.log("\n\nStarting compilation");
    var inputStream = CLI.args[0] ? Fs.createReadStream(CLI.args[0]) : process.stdin;
    var outputStream = CLI.args[1] ? Fs.createWriteStream(CLI.args[1]) : process.stdout;

    inputStream.setEncoding(ENCODING);

    inputStream.on("error", (error) => {throw error});
    outputStream.on("error", (error) => {throw error});

    var input:string = ""
    inputStream.on("data", (chunk) => {input += chunk})

    inputStream.on("end", () => {
      try {
        var output = JSON.stringify(Parser.parse(input).evaluate(), null, 2) + "\n";
        MapboxGLStyleSpec.validate(output);

        if (outputStream == process.stdout) {
          outputStream.write(output, ENCODING);
        } else {
          outputStream.end(output, ENCODING);
        }

        assert(CLI.args[1]);
        console.log("Done compilation");
      } catch (e) {
        console.log(e.toString())
        console.log(e.stack)
      }
    });
}
