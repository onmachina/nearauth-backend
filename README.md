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

## Base64 User Credentials

`<base64 credentials>` is like a "password" derived from NEAR account secret key.

It can be obtained with the following command:

```bash
npm run auth alice.testnet
```

Output is a Base64 string. Use it as a `<base64 credentials>` parameter.

## How to Run Tests

Run automated tests:

```bash
npm test
```

## Test Manually

Start the server:

```bash
npm start
```

Send an HTTP request in another terminal:

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