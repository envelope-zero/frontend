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
docker run --rm -p 8080:80 -v ez-data:/data -e CORS_ALLOW_ORIGINS=http://localhost:3000 ghcr.io/envelope-zero/backend:v0.22.0
```

This will persist the database in a docker volume called `ez-data` so when you restart the container (which will remove it due to the `--rm` flag), it will have the already saved data.

Once the backend is running, you can start the development server for the frontend. Run

```sh
REACT_APP_API_ENDPOINT=http://localhost:8080/v1 npm run start
```

If you used another port for the backend above, you’ll need to change it in the `REACT_APP_API_ENDPOINT` variable, too.

You can also save the environment variable to `.env` file as `REACT_APP_API_ENDPOINT="=http://localhost:8080/v1"`. With this, you can just run `npm run start`.

## Commit messages

This project uses [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
to enable better overview over changes and enables automated tooling based on commit messages.
