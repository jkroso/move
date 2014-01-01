
serve: node_modules
	@node_modules/serve/bin/serve -Slojp 0

node_modules: *.json
	@packin install \
		--meta deps.json,package.json,component.json \
		--folder node_modules

.PHONY: serve
