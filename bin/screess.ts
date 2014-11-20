/// <reference path="../definitions/index.d.ts" />

import CLI = require('commander');
import Fs = require('fs');
var Package = require('../../package.json');
var Parser = require('../../compiled/source/parser');

var ENCODING = "utf8";

CLI.version(Package.version)
CLI.usage("[<input-screess>=stdin [<output-json>=stdout]]")
CLI.parse(process.argv)

var inputStream = CLI.args[0] ? Fs.createReadStream(CLI.args[0]) : process.stdin;
var outputStream = CLI.args[1] ? Fs.createWriteStream(CLI.args[1]) : process.stdout;

var input:string = ""

inputStream.setEncoding(ENCODING)

inputStream.on("error", (error) => {throw error})
outputStream.on("error", (error) => {throw error})
inputStream.on("data", (chunk) => {input += chunk})
inputStream.on("end", () => {
  var output = JSON.stringify(Parser.parse(input), null, 2) + "\n";
  if (outputStream == process.stdout) {
    outputStream.write(output, ENCODING)
  } else {
    outputStream.end(output, ENCODING)
  }
});