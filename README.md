## Prerequisites

- docker
- node
- curl

## Usage

To start the application run the following command:
`make start`

### Endpoints

You can query the endpoints using the following commands:

`make finance`
`make history`
`make senior`

### EXPLAIN

You can get the EXPLAIN output for the endpoints using the following commands:

`make explain-finance`
`make explain-history`
`make explain-senior`

### Database Connection

To open a database shell use:
`make connect-db`