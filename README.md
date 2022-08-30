# Envelope Zero frontend

Envelope Zero is fundamentally rooted in two ideas:

- Using the [envelope method](https://en.wikipedia.org/wiki/Envelope_system) to budget expenses into envelopes.
- Zero Based Budeting, meaning that you assign all your money to an envelope. Saving for a vacation? Create an envelope and archive it after your vacation. Rent? Create an envelope that gets a fixed amount of money added every month.

## Deployment

The frontend currently has two requirements:

- The API needs to be available at the same hostname with the prefix `/api`
- Only `v1` of the API is supported

## Supported Versions

This project is under heavy development. Therefore, only the latest release is supported.

Please check the [releases page](https://github.com/envelope-zero/frontend/releases) for the latest release.

Check the table below for the minimal required frontend version for specific [backend](https://github.com/envelope-zero/backend) versions.

Please note that below version 1.0.0, any new minor version for the backend might break compatibility.

| Backend version | Minimal frontend version |
| --------------- | ------------------------ |
| v0.22.0+        | 0.9.0                    |

## Contributing

Please see [the contribution guidelines](CONTRIBUTING.md).
