
serve: node_modules
	@node_modules/serve/bin/serve -Slojp 0

node_modules: *.json
	@packin install \
		--meta package.json,component.json,deps.json \
		--folder node_modules \
		--executables \
		--no-retrace

.PHONY: serve
