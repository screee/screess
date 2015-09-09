import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import ExpressionSet = require("../ExpressionSet");
import Value = require("../values/Value");
import _ = require("../utilities");
import ArgumentsDefinition = require('../ArgumentsDefinition')
import Expression = require('../expressions/Expression');

class MacroDefinitionStatement extends Statement {

  constructor(public name:string, public argumentsDefinition:ArgumentsDefinition, public body:Expression) {
    super();
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {}

}

export = MacroDefinitionStatement
