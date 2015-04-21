HASHMARK = $(shell echo "\#")
NEWLINE = $(shell echo "\n")

clean:
	rm -r compiled/*

build: build-pegjs build-ts-source build-coffee-source

build-pegjs:
	pegjs \
		--plugin pegjs-coffee-plugin \
		--allowed-start-rules global,expression \
		--cache \
			source/parser.pegcs \
			compiled/parser.js

build-coffee-source:
	coffee \
		--compile \
		--output compiled \
		--map \
		source

build-ts-source: build-pegjs build-coffee-source
	tsc \
		--sourceMap \
		--target ES5 \
		--module commonjs \
		--outDir ./compiled \
		source/*.ts source/**/*.ts

test: build
	mocha --compilers coffee:coffee-script/register tests

test-debug: build
	mocha --debug-brk --compilers coffee:coffee-script/register tests
