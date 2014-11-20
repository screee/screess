clean:
	rm -r compiled/source/*

build: build-pegjs build-ts-source build-coffee-source

build-pegjs:
	pegjs \
		--plugin pegjs-coffee-plugin \
		--allowed-start-rules global,valueExpression,propertyMacroDefinitionScopeArguments,valueMacroDefinitionArguments \
			source/parser.pegcs \
			compiled/source/parser.js

build-coffee-source:
	coffee \
		--compile \
		--output compiled/source \
		--map \
		source

build-ts-source: build-pegjs build-coffee-source
	tsc \
		--sourceMap \
		--target ES5 \
		--module commonjs \
		--outDir ./compiled/source \
		source/*.ts source/**/*.ts

test: build
	mocha --compilers coffee:coffee-script/register tests

test-debug: test
	open http://127.0.0.1:8080/debug?port=5858