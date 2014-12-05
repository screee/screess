var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = (function () {
    function Statement() {
    }
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
        return PropertyStatement;
    })(Statement);
    Statement.PropertyStatement = PropertyStatement;
    var IfStatement = (function (_super) {
        __extends(IfStatement, _super);
        function IfStatement(expression, scope) {
            _super.call(this);
            this.expression = expression;
            this.scope = scope;
        }
        return IfStatement;
    })(Statement);
    Statement.IfStatement = IfStatement;
    var ElseIfStatement = (function (_super) {
        __extends(ElseIfStatement, _super);
        function ElseIfStatement(expression, scope) {
            _super.call(this);
            this.expression = expression;
            this.scope = scope;
        }
        return ElseIfStatement;
    })(Statement);
    Statement.ElseIfStatement = ElseIfStatement;
    var ElseStatement = (function (_super) {
        __extends(ElseStatement, _super);
        function ElseStatement(scope) {
            _super.call(this);
            this.scope = scope;
        }
        return ElseStatement;
    })(Statement);
    Statement.ElseStatement = ElseStatement;
})(Statement || (Statement = {}));
module.exports = Statement;
//# sourceMappingURL=Statement.js.map