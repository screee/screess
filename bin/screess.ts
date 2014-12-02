/// <reference path="../definitions/index.d.ts" />

import CLI = require('commander');
import Fs = require('fs');
import Path = require('path');
import ChildProcess = require('child_process')
import assert = require('assert');
var Parser = require('../source/parser');
var Package = require('../../package.json');
var Linter = require('mapbox-gl-style-lint')

var ENCODING = "utf8";

CLI.version(Package.version)
CLI.usage('[<input-screess>=stdin [<output-json>=stdout]]');
CLI.option('-p, --preview', 'Open the stylesheet in the mapbox-gl-native viewer (OSX Only)');
CLI.option('-w, --watch', 'Monitor the source file for changes and automatically recompile');
CLI.parse(process.argv)

compile();

if (CLI['watch']) {
  assert(CLI.args[0])
  Fs.watchFile(CLI.args[0], {interval: 100}, () => {
    compile();
  });
}

function escape(input:string):string {
  return input.replace(" ", "\\ ")
}

function preview(style:string):void {
  var command1 =
    'env ' +
      'MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibHVjYXN3b2oiLCJhIjoiNWtUX3JhdyJ9.WtCTtw6n20XV2DwwJHkGqQ ' +
    'open ' +
      '--background ' +
      'mapboxgl://?style=' + Path.resolve(style);

  console.log("Refreshing preview");
  var child1 = ChildProcess.exec(command1, (error, stdout, stderr) => {});
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
        var output = JSON.stringify(Parser.parse(input), null, 2) + "\n";
        Linter(output);

        if (outputStream == process.stdout) {
          outputStream.write(output, ENCODING);
        } else {
          outputStream.end(output, ENCODING);
        }

        assert(CLI.args[1]);
        if (CLI['preview']) preview(CLI.args[1]);
        console.log("Done compilation");
      } catch (e) {
        console.log(e.toString())
      }
    });
}