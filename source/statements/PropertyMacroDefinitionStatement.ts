import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import ExpressionSet = require("../ExpressionSet");
import Value = require("../values/Value");
import _ = require("../utilities");
import ValueSetDefinition = require('../ValueSetDefinition')

class PropertyMacroDefinitionStatement extends Statement {

  constructor(public name:string, public argDefinition:ValueSetDefinition, public body:Scope) {
    super();
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {}

}

export = PropertyMacroDefinitionStatement
