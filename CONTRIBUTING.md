# Contributing

Contributions are welcome. Please note the [Code of Conduct](CODE_OF_CONDUCT.md) and set up pre-commit as described below.

## Tool & Repository setup

You will need the following tools:

- [pre-commit](https://pre-commit.com/)

Once those are installed, run `make setup` to perform the repository setup.

## Development server

:information_source: If you need any help with those steps, please [open a blank issue](https://github.com/envelope-zero/frontend/issues/new). We’re happy to help!

To run a development server, you will need to run a backend instance. You can launch one as OCI image, for example with docker, run:

```sh
npm run backend
```

This will persist your test data in a docker volume, so you can always stop the container and restart it later. To clean the data, run `docker volume rm data` after stopping the container.

Once the backend is running, you can start the development server for the frontend.

If you do not already have a `.env` file, create it in the repository root and add the following line:

```sh
REACT_APP_API_ENDPOINT="http://localhost:8080/v1"
```

Then, run `npm run start`.

## Tests

Please write tests when you add features and add regression tests for bug fixes. We use [cypress](https://docs.cypress.io) for end-to-end testing of the frontend, see the [cypress/e2e](cypress/e2e/) directory for all tests.

You can run the tests as follows:

```sh
# Open a terminal
npm run backend:update && npm run backend

# Open another terminal
npm run start

# Open a third terminal
npm run test

# If you want to see your browser go wrooom and inspect the tests in detail, instead of npm run test, use
npm run test:watch
```

## Commit messages

This project uses [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
to enable better overview over changes and enables automated tooling based on commit messages.
