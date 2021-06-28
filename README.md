[![Package Status](https://img.shields.io/npm/v/@percy/cypress.svg)](https://www.npmjs.com/package/@percy/cypress) [![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/percy/percy-cypress) [![CircleCI](https://circleci.com/gh/percy/percy-cypress.svg?style=svg)](https://circleci.com/gh/percy/percy-cypress)

## Run tests:

- `cd` to project root directory in terminal.
- Run `npm i` to install dependencies.
- Copy cypress.env.json.sample to cypress.env.json and fill out missing credentials
- Run functional tests using `npm run cy:test` command.

For visual tests:

- Set following environment variables.

```
export PERCY_TOKEN=*
```

- Run visual tests using `npm run cy:visual:test` command.

## Run tests:

- Remove these folders and files(if exist) before generating the report.
  - [./cypress/results](./cypress/results) folder.
  - [./mochawesome-report](./mochawesome-report) folder.
  - [./mochawesome.json](./mochawesome.json) file.
- Run `npm run cy:report` command.

## Frameworks and plugins:

- cypress.io
- faker.js
- percy.io
