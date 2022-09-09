# Contributing

Contributions are welcome. Please note the [Code of Conduct](CODE_OF_CONDUCT.md) and set up pre-commit as described below.

## Tool & Repository setup

You will need the following tools:

- [pre-commit](https://pre-commit.com/)

Once those are installed, run `make setup` to perform the repository setup.

## Development server

:information_source: If you need any help with those steps, please [open a blank issue](https://github.com/envelope-zero/frontend/issues/new). We’re happy to help!

To simplify development, we provide docker-compose files that run the backend and frontend together. With this, you can run

```sh
npm run server:dev
```

and wait for ~1 minute (if you know why `react-scripts start` takes this long in a container, we're happy about pointers). Then, open [http://localhost:3000](http://localhost:3000) in your browser.

## Tests

Please write tests when you add features and add regression tests for bug fixes. We use [cypress](https://docs.cypress.io) for end-to-end testing of the frontend, see the [cypress/e2e](cypress/e2e/) directory for all tests.

You can run the tests as follows:

```sh
# Open a terminal
npm run server:test

# Wait for ~1 minute (if you know why `react-scripts start` takes this long in a container, we're happy about pointers)
npm run test

# If you want to see your browser go wrooom and inspect the tests in detail, instead of npm run test, use
npm run test:watch

# To run only a specific test, use
npm run test -- -s $PATH_TO_SPEC
```

## Commit messages

This project uses [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
to enable better overview over changes and enables automated tooling based on commit messages.
