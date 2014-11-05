Jison = require("jison")

rule = (token, name = token) -> [token, "return #{name}"]

grammar =

  comment: "ScreeSS is a CSS-like language that compiles into MapBox GL JSON stylesheets."
  author: "Lucas Wojciechowsi <lucas@lucaswoj.com>"

  lex:
    macros:
      "name": "[a-z][a-z0-9-]*"

    rules: [
      [":", "return ':'"]
      [",", "return ','"]
      ["\\{", "return '{'"]
      ["\\}", "return '}'"]
      ["\\(", "return '('"]
      ["\\)", "return ')'"]
      ["\\[", "return '['"]
      ["\\]", "return ']'"]
      [";", "return ';'"]

      ["=", "return '='"]
      [">=", "return '>='"]
      ["<=", "return '<='"]
      [">", "return '>'"]
      ["<", "return '<'"]
      ["!=", "return '!='"]
      ["in", "return 'IN'"]
      ["!in", "return 'NOT_IN'"]

      ["\\+", "return '+'"]
      ["-", "return '-'"]
      ["\\*", "return '*'"]
      ["\\/", "return '/'"]

      ["and", "return 'AND'"]
      ["&&", "return 'AND'"]
      ["or", "return 'OR'"]
      ["\\|\\|", "return 'OR'"]
      ["not", "return 'NOT'"]
      ["!", "return 'NOT'"]

      ["\\s+", "/* skip whitespace */"]

      ["[1-9][0-9]*", "return 'INTEGER'"]
      ["\"[^\"]*\"", "return 'STRING'"]

      ["true\\b", "return 'TRUE'"]
      ["false\\b", "return 'FALSE'"]
      ["$type", "return 'NAME'"]
      ["{name}", "return 'NAME'"]
      ["\#{name}", "return 'LAYER_NAME'"]
      ["\\.{name}", "return 'CLASS_NAME'"]
      ["\\@{name}", "return 'ATTRIBUTE_NAME'"]
    ]

  operators: [
      ["left", "+", "-"],
      ["left", "*", "/"],
      ["left", ">=", "<=", ">",  "<",  "!=", "in", "!in"]
      ["right", "NOT"],
      ["left", "AND", "OR"]
  ]

  start: "scopeItems"

  bnf:
    macroReference: ["NAME", "NAME ( macroReferenceArguments )"]
    macroReferenceArguments: [
      "macroReferenceArguments , macroReferenceArgument"
      "macroReferenceArgument"
    ]
    macroReferenceArgument: [
      "expressionValue",
      "NAME : expressionValue"
    ]

    macroScopeDefinition: [
      "NAME ( macroDefinitionArguments ) = scope"
      "NAME = scope"
    ]
    macroValueDefinition: [
      "NAME ( macroDefinitionArguments ) = expressionValue ;"
      "NAME = expressionValue ;"
    ]
    macroDefinitionArguments: [
      "macroDefinitionArguments , macroDefinitionArgument"
      "macroDefinitionArgument"
    ]
    macroDefinitionArgument: [
      "NAME",
      "NAME = expressionValue",
      "NAME : NAME"
      "NAME : NAME = expressionValue"
    ]

    selector: ["[ expressionLogic ]"]

    scope: ["{ scopeItems }"]
    scopeItems: ["scopeItem", "scopeItems scopeItem"]
    scopeItem: [
      "LAYER_NAME scope"
      "LAYER_NAME selector scope"
      "CLASS_NAME scope"
      "NAME : expressionValue ;"
      "NAME ;"
      "macroScopeDefinition"
      "macroValueDefinition"
    ]

    set: ["( setItems )"]
    setItems: ["setItems , expressionValue", "expressionValue"]

    expressionValue: [
      "STRING"
      "INTEGER"
      "macroReference"
      "ATTRIBUTE_NAME"
      "TRUE"
      "FALSE"
      "expressionValue + expressionValue"
      "expressionValue - expressionValue"
      "expressionValue * expressionValue"
      "expressionValue / expressionValue"
    ]

    expressionComparison: [
      "expressionValue = expressionValue",
      "expressionValue >= expressionValue",
      "expressionValue <= expressionValue",
      "expressionValue > expressionValue",
      "expressionValue < expressionValue",
      "expressionValue != expressionValue",
      "expressionValue IN expressionValue"
      "expressionValue NOT_IN expressionValue"
    ]
    expressionLogic: [
      "expressionComparison"
      "( expressionLogic )"
      "NOT expressionLogic"
      "expressionLogic AND expressionLogic"
      "expressionLogic OR expressionLogic"
    ]

parser = new Jison.Parser(
  grammar,
  type: "slr",
  moduleType: "commonjs",
  moduleName: "screess"
)

console.log(parser.parse("""

foo-bar: baz;
baz = 6;
test = name;
test(foo, bar, baz) = {
  green;
}

baz(foo, bax:foo) = {
  test: foo;
  foo;

  .class {
    bar: test(name:3, 2);
  }
}

#test[test=bar] {
  test: 7;

  .test{
    foo: test(5, derp: 7);
  }
}


"""))
