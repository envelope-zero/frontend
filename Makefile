.PHONY: setup
setup:
	pre-commit install --hook-type pre-commit
	npm install
