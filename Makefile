
serve: node_modules
	@node_modules/serve/bin/serve -Slo

node_modules: *.json
	@packin install \
		--meta package.json,component.json,deps.json \
		--folder node_modules \
		--executables \
		--no-retrace

build: index.html built.js

index.html: index.jade
	curl http://localhost:3000/index.jade \
		| sed -e "s/src=\"examples.js\"/src=\"built.js\"/" \
		> $@

built.js: examples.js
	curl http://localhost:3000/examples.js > $@

clean:
	rm built.js index.html

.PHONY: serve build clean