'use strict';
const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const client = axios.create({
  baseURL: 'http://localhost:5000',
});

describe('Smoke Test', function () {
  it('should get a meaningful response', async () => {
    await expect(client.get(`/auth/v1.0`)).to.be.rejectedWith(/400/);
    await expect(client.get(`/auth/v2.0`)).to.be.rejectedWith(/404/);
    await expect(client.post(`/auth/v1.0`)).to.be.rejectedWith(/405/);
  });
});

describe('Client', function () {
  it('should create authentication credentials having NEAR account', async () => {
    // The same as `walletConnection.connection` using the Wallet API.
    const connection = global.aliceAccount.connection;
    const aliceId = global.aliceAccount.accountId;

    const signer = connection.signer;
    const networkId = connection.networkId;

    const identity = Buffer.from(aliceId);
    const signature = await signer.signMessage(identity, aliceId, networkId);

    const credentials = JSON.stringify({
      data: [...identity],
      signature: [...signature.signature],
      publicKey: [...signature.publicKey.data],
    });

    await expect(
      client.get('/auth/v1.0', {
        headers: {
          'x-auth-user': 'any',
          'x-auth-key': credentials,
        },
      })
    ).not.to.be.eventually.rejected;
  });
});
