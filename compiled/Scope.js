var FS = require("fs");
var Path = require("path");
var assert = require("assert");
var _ = require("./utilities");
var ValueSet = require("./ValueSet");
var ValueSetDefinition = require('./ValueSetDefinition');
var LiteralExpression = require('./expressions/LiteralExpression');
var Stack = require('./Stack');
var MacroDefinitionStatement = require('./statements/MacroDefinitionStatement');
var evaluateGlobalScope = require('./scopes/global');
var evaluateLayerScope = require('./scopes/layer');
var evaluateClassScope = require('./scopes/class');
var evaluateObjectScope = require('./scopes/object');
var Parser = require("./parser");
var Scope = (function () {
    function Scope(parent) {
        this.parent = parent;
        this.statements = [];
        this.name = null;
        this.macros = [];
        this.sources = {};
    }
    Scope.createFromFile = function (file) {
        return Parser.parse(FS.readFileSync(file, "utf8"));
    };
    Scope.getCoreLibrary = function () {
        if (!this.coreLibrary) {
            this.coreLibrary = this.createFromFile(Path.join(__dirname, "../core.sss"));
        }
        return this.coreLibrary;
    };
    Scope.createGlobal = function () {
        var scope = new Scope(null);
        scope.name = "[global]";
        // TODO rename to something else
        scope.addMacro("include", ValueSetDefinition.WILDCARD, function (args, stack) {
            var file = args.positional[0];
            stack.getScope().includeScope(Scope.createFromFile(file));
        });
        return scope;
    };
    // TODO rename isGlobalScope
    Scope.prototype.isGlobal = function () {
        return !this.parent;
    };
    Scope.prototype.getGlobalScope = function () {
        return this.isGlobal() ? this : this.parent.getGlobalScope();
    };
    Scope.prototype.includeScope = function (scope, stack, callback) {
        scope.eachPrimitiveStatement(stack, callback);
        this.macros = scope.macros.concat(this.macros);
    };
    //////////////////////////////////////////////////////////////////////////////
    // Construction
    // TODO this belongs somewhere else, semantically. Maybe on the Stack object, renamed to "context"?
    Scope.prototype.addSource = function (source) {
        var hash = _.hash(JSON.stringify(source)).toString();
        this.getGlobalScope().sources[hash] = source;
        return hash;
    };
    Scope.prototype.addStatement = function (statement) {
        this.statements.push(statement);
        if (statement instanceof MacroDefinitionStatement) {
            this.addMacro(statement.name, statement.argDefinition, statement.body);
        }
    };
    Scope.prototype.addStatements = function (statements) {
        for (var i = 0; i < statements.length; i++) {
            this.addStatement(statements[i]);
        }
    };
    //////////////////////////////////////////////////////////////////////////////
    // Macro Construction
    Scope.prototype.addLiteralMacros = function (macros) {
        for (var identifier in macros) {
            var value = macros[identifier];
            this.addLiteralMacro(identifier, value);
        }
    };
    Scope.prototype.addLiteralMacro = function (identifier, value) {
        this.addMacro(identifier, ValueSetDefinition.ZERO, new LiteralExpression(value));
    };
    Scope.prototype.addMacro = function (name, argDefinition, body) {
        var Macro_ = require("./macros/Macro");
        var macro = new Macro_(this, name, argDefinition, body);
        this.macros.unshift(macro);
    };
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation Helpers
    Scope.prototype.getMacro = function (name, values, stack) {
        for (var i in this.macros) {
            var macro = this.macros[i];
            if (macro.matches(name, values) && !_.contains(stack.macros, macro)) {
                return macro;
            }
        }
        if (this.parent) {
            return this.parent.getMacro(name, values, stack);
        }
        else {
            return null;
        }
    };
    Scope.prototype.eachMacro = function (callback) {
        for (var i in this.macros) {
            callback(this.macros[i]);
        }
        if (this.parent)
            this.parent.eachMacro(callback);
    };
    Scope.prototype.getMacrosAsFunctions = function (stack) {
        var _this = this;
        var names = [];
        this.eachMacro(function (macro) {
            names.push(macro.name);
        });
        names = _.uniq(names);
        return _.objectMap(names, function (name) {
            var that = _this;
            return [name, function () {
                var args = ValueSet.fromPositionalValues(_.toArray(arguments));
                var macro = that.getMacro(name, args, stack);
                if (!macro)
                    return null;
                else
                    return macro.evaluateToIntermediate(args, stack);
            }];
        });
    };
    // Properties, layers, classes
    Scope.prototype.eachPrimitiveStatement = function (stack, callback) {
        var statements = this.statements;
        assert(stack != null);
        for (var i = 0; i < statements.length; i++) {
            statements[i].eachPrimitiveStatement(this, stack, callback);
        }
    };
    // TODO actually do a seperate pass over each primitive statement to extract this
    Scope.prototype.getVersion = function () {
        return this.getGlobalScope().version || 7;
    };
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation
    // Move these into individual files
    Scope.prototype.evaluate = function (type, stack) {
        if (type === void 0) { type = 0 /* GLOBAL */; }
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this);
        var layers = [];
        var classes = [];
        var properties = {};
        if (type == 0 /* GLOBAL */) {
            this.version = parseInt(properties["version"], 10) || 7;
            this.includeScope(Scope.getCoreLibrary(), stack, function (scope, statement) {
                statement.evaluate(scope, stack, layers, classes, properties);
            });
        }
        this.eachPrimitiveStatement(stack, function (scope, statement) {
            statement.evaluate(scope, stack, layers, classes, properties);
        });
        layers = _.sortBy(layers, 'z-index');
        var evaluator;
        if (type == 0 /* GLOBAL */) {
            evaluator = evaluateGlobalScope;
        }
        else if (type == 1 /* LAYER */) {
            evaluator = evaluateLayerScope;
        }
        else if (type == 2 /* CLASS */) {
            evaluator = evaluateClassScope;
        }
        else if (type == 3 /* OBJECT */) {
            evaluator = evaluateObjectScope;
        }
        else {
            assert(false);
        }
        var output = evaluator.call(this, stack, properties, layers, classes);
        stack.scope.pop();
        return output;
    };
    Scope.coreLibrary = null;
    return Scope;
})();
var Scope;
(function (Scope) {
    (function (Type) {
        Type[Type["GLOBAL"] = 0] = "GLOBAL";
        Type[Type["LAYER"] = 1] = "LAYER";
        Type[Type["CLASS"] = 2] = "CLASS";
        Type[Type["OBJECT"] = 3] = "OBJECT";
    })(Scope.Type || (Scope.Type = {}));
    var Type = Scope.Type;
})(Scope || (Scope = {}));
module.exports = Scope;
//# sourceMappingURL=Scope.js.map