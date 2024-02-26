# OnMachina authentication demo with NEAR credentials

A simple authentication server with NEAR credentials built on ExpressJS.

The authentication server introduces a GET HTTP endpoint which is compatible with a standard `swift` CLI.

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H 'x-auth-key: <base64 credentials>'
```

## Prerequisites

```bash
npm install
```

## Start the server

```bash
npm start
```

_For testing on the **NEAR sandbox** see instructions below._

## Obtain Base64 user credentials

`<base64 credentials>` is like a "password" derived from NEAR account secret key.

It can be obtained with the following command:

```bash
npm run auth alice.testnet
```

Output is a Base64 string. Use it as a `<base64 credentials>` parameter to obtain the JWT token.

## Use credentials to get authenticated

### `swift`

Authenticate using a `swift` tool:

```bash
eval $(swift -A http://127.0.0.1:5000/auth/v1.0 -U any -K <base64 credentials> auth)
```

It will _automatically_ set up `OS_AUTH_TOKEN` and `OS_STORAGE_URL` environment variables.

```bash
export OS_AUTH_TOKEN=<x-auth-token header>
export OS_STORAGE_URL=<x-storage-url header>
```

### `curl`

An advanced way is sending an HTTP request via `curl`:

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H 'x-auth-key: <base64 credentials>'
```

Output is an `x-auth-token` header with JWT token which is used
on the Swift proxy server. `x-storage-url` header is also returned.

## Persistance

```bash
npm install pm2 -g

pm2 start src/index.js
pm2 save
```

## How to Run Tests

```bash
npm run test
npm run test:e2e
```

## How to Test with NEAR Sandbox

Start the server.

```bash
npm run start
```

Start the NEAR sandbox.

```bash
npm run sandbox
```

Create an `alice.test.near` account.

```bash
near create-account alice.test.near --masterAccount test.near --initialBalance 10 --nodeUrl http://localhost:3030 --keyPath /tmp/near-auth-test-sandbox/validator_key.json --networkId sandbox
```

Generate login credentials.

```bash
CREDS=`npm run auth -- alice.test.near --networkId sandbox`
```

Login.

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H "x-auth-key: ${CREDS}" -v
```

Extract the JWT token from the `x-auth-token` response header.

```bash
JWT=<x-auth-token>
```

Test a backend API.

```bash
curl localhost:5001/metrics -H "Authorization: Bearer ${JWT}" -v
```

## How to Generate a Test Keypair and `jwks.json`

Generate a private key for a EC curve (ES256):

```bash
openssl ecparam -name prime256v1 -genkey -noout -out prime256v1-private-key.pem
```

Generate a corresponding public key:

```bash
openssl ec -in prime256v1-private-key.pem -pubout -out prime256v1-public-key.pem
```

Put them the the `./test` directory.

Extract `x` and `y` from the public key PEM to use them in the `jwks.json`:

```bash
openssl pkey -pubin -in test/prime256v1-public-key.pem -pubout -outform der -out pubout
xxd -plain -s -64 -l 32 pubout | xxd -r -p | base64 # x
xxd -plain -s -32 -l 32 pubout | xxd -r -p | base64 # y
```

_Remove "=" padding symbol from the `x` and `y` base64 output!_

Paste `x` and `y` to `./.well-known/jwks.json`.
