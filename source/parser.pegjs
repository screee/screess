{
  var _ = require('./utilities');
  var assert = require('assert');
  var ScreeSS = require("./index");

  var file = null;
  if (this && this.file) {
    file = this.file;
    this.file = null;
  }

  // UNEXPECTED GLOBAL VARS
  var scope = null;
  var globalScope = null;

  function pushScope(scopeNew) {
    scopeNew = scopeNew || new ScreeSS.Scope(scope);
    assert(scopeNew instanceof ScreeSS.Scope, "Malformed arguments to pushScope");
    assert(scopeNew.parent == scope, "Next scope must be child of current scope");
    scope = scopeNew;
    return scope;
  }

  function popScope(statements) {
    var scopeOld = scope;
    var scopeNew = scope.parent;
    scope = scopeNew;
    return scopeOld;
  }

  function rehead(head, body) {
    return [head].concat(_.pluck(body, 1));
  }

}

identifier = a:[A-Za-z]b:[a-zA-Z0-9-_]* { return a + b.join(""); }
namespacedIdentifier = head:identifier tail:( "::" identifier )* { return rehead(head, tail.join("")).join(""); }

comment = "//" [^\n\r]* { return null; }

whitespaceWeak = " " / "\t" { return null; }
whitespaceStrong = comment? "\n" / "\r" { return null; }
whitespace = whitespaceStrong / whitespaceWeak { return null; }

expressionSeperator = ((whitespace* "," whitespace*) / whitespace+) { return null; }
statementSeperator = whitespaceWeak* (";" / whitespaceStrong) whitespace* { return null; }

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                  Scope                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

global = &{ globalScope = scope = globalScope || ScreeSS.Scope.createGlobal(); return true; } whitespace* statements:scopeBody whitespace* { globalScope.addStatements(statements); return globalScope; }

scope = &{ pushScope(); return true; } "{" whitespace* body:scopeBody whitespace* "}" { scope.addStatements(body); return popScope(); }

scopeBody = statements:(head:statement tail:(statementSeperator statement)* statementSeperator? whitespace* { return rehead(head, tail) })? comment? whitespace* { return _.compact(statements) || [] }

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 Arguments                                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

arguments =
  head:argumentsItem tail:(expressionSeperator argumentsItem)* { return new ScreeSS.ExpressionSet(rehead(head, tail)); }

argumentsItem =
  name:(identifier / integer) whitespace* ":" whitespace* expression:expression { return { name: name, expression: expression } } /
  expression:expression { return { expression: expression } }

argumentsDefinition =
  "(" whitespace* "*" whitespace* ")" { return ScreeSS.ArgumentsDefinition.WILDCARD } /
  "(" whitespace* head:argumentsDefinitionItem tail:(expressionSeperator argumentsDefinitionItem)* whitespace* ")" { return new ScreeSS.ArgumentsDefinition(rehead(head, tail), scope) } /
  "" { return ScreeSS.ArgumentsDefinition.ZERO }

argumentsDefinitionItem =
  name:identifier whitespace* "=" whitespace* expression:expression { return { name: name, expression: expression } } /
  name:identifier { return { name: name } }

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 Statement                                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

statement =
  comment /
  macroDefinitionStatement /
  macroReferenceStatement /
  layerStatement /
  classStatement /
  loopStatement /
  conditionalStatement /
  propertyStatement /
  javascriptStatement

propertyStatement =
  name:identifier whitespace* ":" whitespace* expression:expression { return new ScreeSS.PropertyStatement(name, expression) }

macroDefinitionStatement =
  name:namespacedIdentifier whitespace* args:argumentsDefinition whitespace* "=" whitespace* body:expression { return new ScreeSS.MacroDefinitionStatement(name, args, body) }

macroReferenceStatement =
  name:namespacedIdentifier whitespace* "(" whitespace* expressions:arguments whitespace* ")" { return new ScreeSS.MacroReferenceStatement(name, expressions) } /
  name:namespacedIdentifier whitespace* "(" whitespace* ")" { return new ScreeSS.MacroReferenceStatement(name, ScreeSS.ExpressionSet.ZERO) }

loopStatement =
  "for" whitespace+ keyIdentifier:identifier expressionSeperator valueIdentifier:identifier whitespace+ "in" whitespace+ collection:expression whitespace* scope:scope { return new ScreeSS.LoopStatement(scope, valueIdentifier, keyIdentifier, collection) } /
  "for" whitespace+ valueIdentifier:identifier whitespace+ "in" whitespace+ collection:expression whitespace* scope:scope { return new ScreeSS.LoopStatement(scope, valueIdentifier, null, collection) }

conditionalStatement =
  ifItem:conditionalStatementIf elseIfItems:( whitespace* conditionalStatementElseIf  )* whitespace* elseItem:conditionalStatementElse? { return new ScreeSS.ConditionalStatement(_.compact(rehead(ifItem, elseIfItems).concat([elseItem]))) }

conditionalStatementIf =
  "if" whitespace+ condition:expression whitespace* scope:scope { return {condition: condition, scope: scope}; }

conditionalStatementElseIf =
  "else if" whitespace+ condition:expression whitespace* scope:scope { return {condition: condition, scope: scope}; }

conditionalStatementElse =
  "else" whitespace* scope:scope { return {condition: new ScreeSS.LiteralExpression(true, ScreeSS.SourceLocation.UNKNOWN), scope: scope} }

layerStatement =
  "#" name:identifier? whitespace* body:scope { return new ScreeSS.LayerStatement(name, body) }

classStatement =
  "." name:identifier whitespace* body:scope { return new ScreeSS.ClassStatement(name, body) }

javascriptStatement =
  "`" body:[^\`]* "`" { return new ScreeSS.JavascriptStatement(body.join("")) }

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 Expression                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

expression =
  filterExpression /
  arithmeticExpression

/////////////////////////////////////////////
//           Filter Expression             //
/////////////////////////////////////////////

filterExpression =
  notOperatorExpression /
  booleanLogicExpression /
  filterStrongExpression

booleanLogicExpression =
  left:filterStrongExpression whitespace* operator:("||" / "&&") whitespace* right:expression { return new ScreeSS.BooleanLogicExpression(operator, [left, right], new ScreeSS.SourceLocation(file, location())) }

notOperatorExpression =
  "!" whitespace* expression:expression { return new ScreeSS.NotOperatorExpression(expression, new ScreeSS.SourceLocation(file, location())) }

/////////////////////////////////////////////
//         Filter Weak Expression          //
/////////////////////////////////////////////

filterStrongExpression =
  groupExpression /
  setOperatorExpression /
  comparisonOperatorExpression /
  typeCheckOperatorExpression

groupExpression =
  whitespace* "(" expression:expression ")" { return expression }

typeCheckOperatorExpression =
  whitespace* "is" whitespace* type:arithmeticExpression { return new ScreeSS.TypeCheckOperatorExpression(type, new ScreeSS.SourceLocation(file, location())) }

comparisonOperatorExpression =
  whitespace* left:arithmeticExpression whitespace* operator:("==" / ">=" / "<=" / "<" / ">" / "!=") whitespace* right:arithmeticExpression { return new ScreeSS.ComparisonOperatorExpression(left, operator, right, new ScreeSS.SourceLocation(file, location())) }

setOperatorExpression =
  whitespace* left:arithmeticExpression whitespace+ operator:("in" / "!in") whitespace+ right:arithmeticExpression { return new ScreeSS.SetOperatorExpression(left, operator, right, new ScreeSS.SourceLocation(file, location())) }

/////////////////////////////////////////////
//     Arithmetic Operator Expression      //
/////////////////////////////////////////////

arithmeticExpression =
  left:arithmeticStrongExpression whitespaceWeak* operator:("+" / "-") whitespaceWeak* right:arithmeticExpression { return new ScreeSS.ArithmeticOperatorExpression(left, operator, right, new ScreeSS.SourceLocation(file, location())) } /
  arithmeticStrongExpression

arithmeticStrongExpression =
  left:propertyAccessExpression whitespaceWeak* operator:("/" / "*") whitespaceWeak* right:arithmeticStrongExpression { return new ScreeSS.ArithmeticOperatorExpression(left, operator, right, new ScreeSS.SourceLocation(file, location())) } /
  "(" whitespace* expression:arithmeticExpression whitespace* ")" { return expression } /
  conditionalExpression

/////////////////////////////////////////////
//            Conditional Expression       //
/////////////////////////////////////////////

conditionalExpression =
  head:propertyAccessExpression whitespaceWeak* '??' whitespaceWeak* tail:conditionalExpression { return new ScreeSS.NullCoalescingExpression(head, tail, new ScreeSS.SourceLocation(file, location())) } /
  condition:propertyAccessExpression whitespaceWeak* '?' whitespaceWeak* trueExpression:conditionalExpression whitespaceWeak* ':' whitespaceWeak* falseExpression:conditionalExpression { return new ScreeSS.TernaryExpression(condition, trueExpression, falseExpression, new ScreeSS.SourceLocation(file, location())) } /
  propertyAccessExpression

/////////////////////////////////////////////
//            Value Expression             //
/////////////////////////////////////////////

propertyAccessExpression =
  head:atomicExpression accesses:(
    "." (integer / identifier) /
    "[" expression "]"
  )* {
    var output = head;

    for (var i = 0; i < accesses.length; i++) {
      var access = accesses[i];
      if (access[0] == ".") {
        output = new ScreeSS.PropertyAccessExpression(output, new ScreeSS.LiteralExpression(access[1], new ScreeSS.SourceLocation(file, location())), new ScreeSS.SourceLocation(file, location()));
      } else if (access[0] == "[") {
        output = new ScreeSS.PropertyAccessExpression(output, access[1], new ScreeSS.SourceLocation(file, location()));
      }
    }

    return output;
  }

/////////////////////////////////////////////
//           Weak Value Expression         //
/////////////////////////////////////////////

atomicExpression =
  javascriptExpression /
  literalExpression /
  macroReferenceExpression /
  stringExpression /
  scopeExpression /
  arrayExpression

literalExpression =
  value:value { return new ScreeSS.LiteralExpression(value, new ScreeSS.SourceLocation(file, location())) }

macroReferenceExpression =
  name:namespacedIdentifier whitespace* "(" whitespace* expressions:arguments whitespace* ")" { return new ScreeSS.MacroReferenceExpression(name, expressions, new ScreeSS.SourceLocation(file, location())) } /
  name:namespacedIdentifier (whitespace* "(" whitespace* ")")? { return new ScreeSS.MacroReferenceExpression(name, ScreeSS.ExpressionSet.ZERO, new ScreeSS.SourceLocation(file, location())) }

stringExpression =
  "\"" body:[^\"]* "\"" { return new ScreeSS.StringExpression(body.join(""), new ScreeSS.SourceLocation(file, location())) } /
  "'" body:[^\']* "'" { return new ScreeSS.StringExpression(body.join(""), new ScreeSS.SourceLocation(file, location())) }

arrayExpression =
  "[" whitespace* head:expression tail:(expressionSeperator expression)* whitespace* "]" { return new ScreeSS.ArrayExpression(_.map(rehead(head, tail)), new ScreeSS.SourceLocation(file, location())) }

scopeExpression =
  body:scope { return new ScreeSS.ScopeExpression(body, new ScreeSS.SourceLocation(file, location())) }

javascriptExpression =
  "`" body:[^\`]* "`" { return new ScreeSS.JavascriptExpression(body.join(""), new ScreeSS.SourceLocation(file, location())) }

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                  Value                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

value =
  null /
  boolean /
  number /
  attributeReferenceValue /
  colorValue

boolean =
  "true" { return true } /
  "false" { return false }

null =
  "null" { return null }

number =
  before:integer? "." after:([0-9]+) { return (before + parseFloat("." + after.join(""))) } /
  number:integer { return number }

integer =
  head:[1-9-] tail:[0-9]* { return parseInt(head + tail.join("")) } /
  "0" { return 0 }

attributeReferenceValue =
  "@" name:identifier { return new ScreeSS.AttributeReferenceValue(name) }

colorValue =
  "#" color:[0-9a-fA-F]+ { return ScreeSS.ColorValue.hex(color.join("")) }
