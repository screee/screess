clean:
	rm -r compiled/*

build: build-pegjs build-ts-source cli

build-pegjs:
	pegjs \
		--plugin pegjs-coffee-plugin \
		--allowed-start-rules global,expression \
		--cache \
			source/parser.pegcs \
			compiled/parser.js

build-ts-source: build-pegjs
	tsc \
		--sourceMap \
		--target ES5 \
		--module commonjs \
		--outDir ./compiled \
		source/*.ts source/**/*.ts

cli: build-ts-source
	echo "#!/usr/bin/env node" > compiled/screess
	cat compiled/CLI.js >> compiled/screess

test: build
	mocha --compilers coffee:coffee-script/register tests

test-debug: build
	mocha --debug-brk --compilers coffee:coffee-script/register tests
