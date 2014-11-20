var literalExpression = require("../expressions/LiteralExpression").literalExpression
var Scope  = require('../scopes/Scope');
var _ = require("../utilities");
import assert = require("assert");
import MacroArgValues = require("./MacroArgValues");
var Options = require("../Options");

class PropertyMacro {

  public scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope, public name, public argDefinition, public body = null) {
    var ClassScope = require("../scopes/ClassScope")
    this.scope = new ClassScope(this.parentScope)

    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;
  }

  toMGLScope(argValues, options) {
    assert(_.is(argValues, MacroArgValues));
    assert(_.is(options, Options));

    var args = argValues.toArguments(this.argDefinition, options)

    var scope = new Scope(this.scope)
    scope.addLiteralValueMacros(args)

    options.scopeStack.push(scope)
    var values = _.extend(
      scope.toMGLProperties(options, this.scope.properties),
      this.body ? this.body.apply({}, argValues) : null
    )
    options.scopeStack.pop()
    return values
  }

  matches(name, argValues) {
    return name == this.name && argValues.matches(this.argDefinition)
  }

}

export = PropertyMacro