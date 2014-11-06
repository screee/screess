BUILD_DIR = ./build

build:
	mkdir -p $(BUILD_DIR)
	coffee -co $(BUILD_DIR) source
	pegjs --plugin pegjs-coffee-plugin source/grammar.pegcs $(BUILD_DIR)/parser.js
	browserify $(BUILD_DIR)/parser.js -o $(BUILD_DIR)/parser.browserify.js
	coffee test.coffee

test:
	pegjs --plugin pegjs-coffee-plugin source/grammar.pegcs source/parser.js
	coffee test.coffee