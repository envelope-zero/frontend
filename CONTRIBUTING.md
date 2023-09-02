# Contributing

Contributions are welcome. Please note the [Code of Conduct](CODE_OF_CONDUCT.md) and set up pre-commit as described below.

## Tool & Repository setup

You will need the following tools:

- [pre-commit](https://pre-commit.com/)

Once those are installed, run `make setup` to perform the repository setup.

## Development server

:information_source: If you need any help with those steps, please [open a blank issue](https://github.com/envelope-zero/frontend/issues/new). We’re happy to help!

To simplify development, we provide docker-compose files that run the backend. With this, you can run

```sh
npm run server:dev
npm start
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

### Running against local development backend

If you're debugging or testing against a local backend development version, start up the backend locally, stop all frontend test and dev environments (the ones started with `npm run server:dev` and `npm run server:test`) and then run `npm run start`.
The default frontend configuration and default backend configuration match up, so you don't need to explicitly configure anything.

## Tests

Please write tests when you add features and add regression tests for bug fixes. We use [cypress](https://docs.cypress.io) for end-to-end testing of the frontend, see the [cypress/e2e](cypress/e2e/) directory for all tests.

You can run the tests as follows:

```sh
# Open a terminal and start the test backend, then the frontend
npm run server:test
npm run start:test

# Runs the tests in your terminal
npm run test

# If you want to see your browser go wrooom and inspect the tests in detail, use this.
# Note that you'll need to select Chrome or Chromium as browser since neither Electron nor Firefox support Month pickers as of now
npm run test:watch

# To run only a specific test, use
npm run test -- -s $PATH_TO_SPEC
```

## Verifying the production build

If you need to verify the production build, do the following:

```sh
# This needs to be a GitHub PAT with the packages:read permission
export GITHUB_TOKEN="CHANGE_ME"
npm run server:production
```

This will start the backend and the frontend together in production configuration.
Open [http://localhost:3001](http://localhost:3001) in your browser to verify.

## Commit messages

This project uses [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
to enable better overview over changes and enables automated tooling based on commit messages.
