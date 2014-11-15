// Generated by CoffeeScript 1.8.0
(function() {
  var MacroArgumentDefinition, MacroArgumentValues, Scope, Value, assert, literalExpression, _;

  Value = require("../values/value");

  MacroArgumentValues = require("../macros/MacroArgumentValues");

  MacroArgumentDefinition = require('../macros/MacroArgumentDefinition');

  assert = require("assert");

  _ = require("../utilities");

  literalExpression = require('../expressions/LiteralExpression').literalExpression;

  module.exports = Scope = (function() {
    function Scope(parent) {
      this.parent = parent;
      assert(!this.parent || _.is(this.parent, Scope));
      this.properties = {};
      this.valueMacros = [];
      this.propertyMacros = [];
    }

    Scope.prototype.getGlobalScope = function() {
      return this.parent.getGlobalScope();
    };

    Scope.prototype.addProperty = function(name, expressions) {
      if (this.properties[name]) {
        throw new Error("Duplicate entries for property '" + name + "'");
      }
      return this.properties[name] = expressions;
    };

    Scope.prototype.addLiteralValueMacros = function(values) {
      var name, value, _results;
      _results = [];
      for (name in values) {
        value = values[name];
        _results.push(this.addValueMacro(name, MacroArgumentDefinition.ZERO, [literalExpression(value)]));
      }
      return _results;
    };

    Scope.prototype.addValueMacro = function(name, argDefinition, body) {
      var ValueMacro, macro;
      assert(_.is(argDefinition, MacroArgumentDefinition) || !argDefinition);
      ValueMacro = require("../macros/ValueMacro");
      if (_.isArray(body)) {
        macro = ValueMacro.createFromExpressions(name, argDefinition, this, body);
      } else if (_.isFunction) {
        macro = ValueMacro.createFromFunction(name, argDefinition, this, body);
      }
      return this.valueMacros.unshift(macro);
    };

    Scope.prototype.addPropertyMacro = function(name, argDefinition, body) {
      var PropertyMacro, macro;
      assert(_.is(argDefinition, MacroArgumentDefinition) || !argDefinition);
      PropertyMacro = require("../macros/PropertyMacro");
      macro = new PropertyMacro(this, name, argDefinition, body);
      this.propertyMacros.unshift(macro);
      return macro.scope;
    };

    Scope.prototype.getSourceScope = function(name) {
      var _ref;
      return this.sourceScopes[name] || ((_ref = this.parent) != null ? _ref.getSourceScope(name) : void 0);
    };

    Scope.prototype.getValueMacro = function(name, argValues, options) {
      var macro, _i, _len, _ref, _ref1;
      _ref = this.valueMacros;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        macro = _ref[_i];
        if (macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)) {
          return macro;
        }
      }
      return (_ref1 = this.parent) != null ? _ref1.getValueMacro(name, argValues, options) : void 0;
    };

    Scope.prototype.getPropertyMacro = function(name, argValues, options) {
      var macro, _i, _len, _ref, _ref1;
      _ref = this.propertyMacros;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        macro = _ref[_i];
        if (macro.matches(name, argValues) && !_.contains(options.propertyMacroStack, macro)) {
          return macro;
        }
      }
      return (_ref1 = this.parent) != null ? _ref1.getPropertyMacro(name, argValues, options) : void 0;
    };

    Scope.prototype.toMGLProperties = function(options, properties) {
      var argValues, expression, expressions, name, output, propertyMacro;
      output = {};
      for (name in properties) {
        expressions = properties[name];
        options.property = name;
        argValues = MacroArgumentValues.createFromExpressions((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = expressions.length; _i < _len; _i++) {
            expression = expressions[_i];
            _results.push({
              expression: expression
            });
          }
          return _results;
        })(), this, options);
        if ((propertyMacro = this.getPropertyMacro(name, argValues, options))) {
          options.propertyMacroStack.push(propertyMacro);
          _.extend(output, propertyMacro.toMGLScope(argValues, options));
          options.propertyMacroStack.pop();
        } else {
          if (argValues.length !== 1 || argValues.positionalArgs.length !== 1) {
            throw new Error("Cannot apply " + argValues.length + " args to primitive property '" + name + "'");
          }
          output[name] = argValues.positionalArgs[0].toMGLValue(options);
        }
        options.property = null;
      }
      return output;
    };

    return Scope;

  })();

}).call(this);
