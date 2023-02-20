# OnMachina authentication demo with NEAR credentials

A simple authentication server with NEAR credentials built on ExpressJS.

The authentication server introduces a GET HTTP endpoint which is compatible with a standard `swift` CLI.

```bash
curl localhost:5000/auth/v1 -H 'x-auth-user: any' -H 'x-auth-key: <base64 credentials>'
```

## How to Run Tests

Install prerequisites:

```bash
npm install
```

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

## Persistance

```bash
npm install pm2 -g

pm2 start src/index.js
pm2 save
```