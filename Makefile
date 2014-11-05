test:
	pegjs --plugin pegjs-coffee-plugin source/grammar.pegcs dist/parser.js
	coffee test.coffee