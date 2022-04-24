## Description
This is a GameManager that will be in charge of:
- create/update match
- set users to play the match
- delete match

So we'll received **Events**
- search-game => from API
- match-ready => from Match
And will send:
- created-match => to API

We're going to implement a pure RabbitMQ consumers/publishers

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```