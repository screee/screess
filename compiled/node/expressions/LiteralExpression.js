// Generated by CoffeeScript 1.8.0
(function() {
  var Expression, LiteralExpression,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Expression = require("./Expression");

  module.exports = LiteralExpression = (function(_super) {
    __extends(LiteralExpression, _super);

    LiteralExpression.literalExpression = function(value) {
      return new LiteralExpression(value);
    };

    function LiteralExpression(value) {
      this.value = value;
    }

    LiteralExpression.prototype.toValues = function() {
      return [this.value];
    };

    return LiteralExpression;

  })(Expression);

}).call(this);