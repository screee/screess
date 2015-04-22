var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("./Scope");
var assert = require("assert");
var _ = require("./utilities");
var Value = require("./values/value");
// TODO put each statement class in its own file
// TODO always pass a scope at statment construction time, don't pass into methods after that
var Statement = (function () {
    function Statement() {
    }
    Statement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        assert(false, "abstract method");
    };
    Statement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        assert(false, "abstract method");
    };
    return Statement;
})();
var Statement;
(function (Statement) {
    var LoopStatement = (function (_super) {
        __extends(LoopStatement, _super);
        function LoopStatement(scope, valueIdentifier, keyIdentifier, collectionExpression) {
            _super.call(this);
            this.scope = scope;
            this.valueIdentifier = valueIdentifier;
            this.keyIdentifier = keyIdentifier;
            this.collectionExpression = collectionExpression;
        }
        LoopStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
            var collection = this.collectionExpression.evaluateToIntermediate(this, stack);
            assert(_.isArray(collection) || _.isObject(collection));
            for (var key in collection) {
                var value = collection[key];
                this.scope.addLiteralValueMacro(this.valueIdentifier, value);
                if (this.keyIdentifier) {
                    this.scope.addLiteralValueMacro(this.keyIdentifier, key);
                }
                this.scope.eachPrimitiveStatement(stack, callback);
            }
        };
        return LoopStatement;
    })(Statement);
    Statement.LoopStatement = LoopStatement;
    var LayerStatement = (function (_super) {
        __extends(LayerStatement, _super);
        function LayerStatement(name, scope) {
            _super.call(this);
            this.name = name;
            this.scope = scope;
        }
        LayerStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
            layers.push(this.scope.evaluate(1 /* LAYER */, stack));
        };
        return LayerStatement;
    })(Statement);
    Statement.LayerStatement = LayerStatement;
    var ClassStatement = (function (_super) {
        __extends(ClassStatement, _super);
        function ClassStatement(name, scope) {
            _super.call(this);
            this.name = name;
            this.scope = scope;
        }
        ClassStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
            classes.push(this.scope.evaluate(2 /* CLASS */, stack));
        };
        return ClassStatement;
    })(Statement);
    Statement.ClassStatement = ClassStatement;
    var PropertyStatement = (function (_super) {
        __extends(PropertyStatement, _super);
        function PropertyStatement(name, expressions) {
            _super.call(this);
            this.name = name;
            this.expressions = expressions;
        }
        PropertyStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
            var values = this.expressions.toValueSet(scope, stack);
            if (values.length != 1 || values.positional.length != 1) {
                throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name);
            }
            properties[this.name] = Value.evaluate(values.positional[0]);
        };
        PropertyStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
            var values = this.expressions.toValueSet(scope, stack);
            var macro;
            if (macro = scope.getPropertyMacro(this.name, values, stack)) {
                stack.propertyMacro.push(macro);
                // Property macros may have primitive statements and/or a body function
                macro.getScope(values, stack).eachPrimitiveStatement(stack, callback);
                if (macro.body)
                    macro.body(values, callback, scope, stack);
                stack.propertyMacro.pop();
            }
            else {
                callback(scope, this);
            }
        };
        return PropertyStatement;
    })(Statement);
    Statement.PropertyStatement = PropertyStatement;
    var ConditionalStatement = (function (_super) {
        __extends(ConditionalStatement, _super);
        // TODO only accept a condition, true statement, and false statement; chain for "else if"
        function ConditionalStatement(items) {
            _super.call(this);
            this.items = items;
        }
        ConditionalStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
            for (var i in this.items) {
                var item = this.items[i];
                if (item.condition.evaluateToIntermediate(scope, stack)) {
                    item.scope.eachPrimitiveStatement(stack, callback);
                    break;
                }
            }
        };
        return ConditionalStatement;
    })(Statement);
    Statement.ConditionalStatement = ConditionalStatement;
})(Statement || (Statement = {}));
module.exports = Statement;
//# sourceMappingURL=Statement.js.map