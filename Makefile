
serve: node_modules
	@node_modules/serve/bin/serve -Slop 3000

node_modules: *.json
	@packin install \
		--meta package.json,component.json,deps.json \
		--folder node_modules

build: index.html built.js

index.html: index.jade
	curl http://localhost:3000/index.jade \
	| sed 's/src="examples.js"/src="built.js"/' \
	> $@

built.js: examples.js
	curl http://localhost:3000/examples.js > $@

clean:
	rm built.js index.html

.PHONY: serve build clean
