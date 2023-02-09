'use strict';
const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const jwt = require('jsonwebtoken');
const fs = require('fs');

chai.config.truncateThreshold = 0;
chai.use(chaiAsPromised);
const expect = chai.expect;

const client = axios.create({
  baseURL: 'http://localhost:5000',
});

const PUBLIC_KEY = fs.readFileSync('test/prime256v1-public-key.pem');

describe('Smoke Test', function () {
  it('should get a meaningful response', async () => {
    await expect(client.get(`/auth/v1.0`)).to.be.rejectedWith(/400/);
    await expect(client.get(`/auth/v2.0`)).to.be.rejectedWith(/404/);
    await expect(client.post(`/auth/v1.0`)).to.be.rejectedWith(/405/);
  });
});

describe('Client', function () {
  it('should get authenticated with NEAR account', async () => {
    // The same as `walletConnection.connection` using the Wallet API.
    const connection = global.aliceAccount.connection;
    const aliceId = global.aliceAccount.accountId;

    const signer = connection.signer;
    const networkId = connection.networkId;

    const identity = Buffer.from(aliceId);
    const signature_data = await signer.signMessage(
      identity,
      aliceId,
      networkId
    );

    const publicKey = Buffer.from(signature_data.publicKey.toString());
    const signature = Buffer.from(signature_data.signature);

    const credentials = Buffer.from(
      JSON.stringify({
        identity: identity.toString('base64'),
        publicKey: publicKey.toString('base64'),
        signature: signature.toString('base64'),
      })
    ).toString('base64');

    const response = await expect(
      client.get('/auth/v1.0', {
        headers: {
          'x-auth-user': 'any',
          'x-auth-key': credentials,
        },
      })
    ).not.to.be.eventually.rejected;

    const token = jwt.verify(response.data, PUBLIC_KEY, { complete: true });

    expect(token).not.null;
    expect(token.payload.sub).to.be.equal(aliceId);
  });
});
