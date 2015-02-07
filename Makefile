clean:
	rm -r compiled/source/*

build: build-pegjs build-ts-source build-coffee-source build-ts-bin

build-pegjs:
	pegjs \
		--plugin pegjs-coffee-plugin \
		--allowed-start-rules global,expression \
		--cache \
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

build-ts-bin:
	tsc \
		--sourceMap \
		--target ES5 \
		--module commonjs \
		--outDir compiled/bin/ \
		bin/screess.ts
	(echo "#!/usr/bin/env node"; cat compiled/bin/screess.js) > compiled/bin/screess
	chmod +x compiled/bin/screess
	rm compiled/bin/screess.js


test: build
	mocha --compilers coffee:coffee-script/register tests

test-debug: test
	open http://127.0.0.1:8080/debug?port=5858
