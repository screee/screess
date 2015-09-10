all: build-pegjs build-typescript cli

clean:
	rm -r compiled typescript_interfaces

build-pegjs:
	mkdir -p compiled
	pegjs \
		--plugin pegjs-coffee-plugin \
		--allowed-start-rules global,expression \
		--cache \
			source/parser.pegcs \
			compiled/parser.js

install-typescript-interfaces:
	mkdir -p typescript_interfaces
	tsd reinstall
	tsd rebundle

build-typescript: build-pegjs install-typescript-interfaces
	tsc \
		--sourceMap \
		--target ES5 \
		--module commonjs \
		--outDir ./compiled \
		source/*.ts source/**/*.ts

cli: build-typescript
	echo "#!/usr/bin/env node" > compiled/screess
	cat compiled/CLI.js >> compiled/screess

.PHONY: test test-debug

test: all
	mocha --compilers coffee:coffee-script/register test

test-debug: all
	mocha --debug-brk --compilers coffee:coffee-script/register test
