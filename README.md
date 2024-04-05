# OnMachina authentication demo with NEAR credentials

A simple authentication server with NEAR credentials built on ExpressJS.

The authentication server introduces a GET HTTP endpoint which is compatible with a standard `swift` CLI.

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H 'x-auth-key: <base64 credentials>'
```

## Prerequisites

Install `./node_modules`.

```bash
npm i
```

Need to login with a NEAR account.

```
npm i -g near-cli
near login
```

## (Optional) Start the local server

```bash
npm start
```

1. It's gonna use a **NEAR sandbox**.
2. For testing on the **NEAR sandbox** see instructions below.
3. For testing on the **NEAR testnet** define `NEAR_ENV=testnet` (use `.env` file).
4. Local server will listen on `http://localhost:5000`.

## Obtain base64 user credentials

`<base64 credentials>` is like a "password" derived from NEAR account secret key.

**Credentials** can be obtained with the following command:

```bash
CRED=`npm run --silent auth -- alice.testnet`
```

Output is a base64 **secret** string. Use it to obtain the JWT token.

## Use credentials to get authenticated

### `swift`

Authenticate using a `swift` tool:

```bash
eval $(swift -A http://127.0.0.1:5000/auth/v1.0 -U any -K ${CRED} auth)
```

It will _automatically_ set up `OS_AUTH_TOKEN` and `OS_STORAGE_URL` environment variables.

### `curl`

An advanced way is sending an HTTP request via `curl`:

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H 'x-auth-key: <base64 credentials>'
```

Output is an `x-auth-token` header with JWT token which is used
on the Swift proxy server. `x-storage-url` header is also returned.

```bash
export OS_AUTH_TOKEN=<x-auth-token header>
export OS_STORAGE_URL=<x-storage-url header>
```

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

## How to Change Configuration

Define `.env` file. Example:

```
NEAR_ENV=testnet
ISSUER=https://auth.global01.onmachina.io/
AUDIENCE=https://api.global01.onmachina.io/
SERVER_STORAGE_DOMAIN=147.28.148.225:8080
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
