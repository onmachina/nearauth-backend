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

const JWT_PUBLIC_KEY = fs.readFileSync('test/prime256v1-public-key.pem');

describe('Smoke Test', function () {
  it('should get a meaningful response', async () => {
    await expect(client.get(`/auth/v1.0`)).to.be.rejectedWith(/400/);
    await expect(client.get(`/auth/v2.0`)).to.be.rejectedWith(/404/);
    await expect(client.post(`/auth/v1.0`)).to.be.rejectedWith(/405/);
  });
});

describe('Client', function () {
  it('should get authenticated with NEAR account', async () => {
    const aliceAccount = global.aliceAccount;

    // The same as `walletConnection.connection` using the Wallet API.
    const connection = aliceAccount.connection;
    const aliceId = aliceAccount.accountId;

    const signer = connection.signer;
    const networkId = connection.networkId;

    const signerPublicKey = (
      await signer.getPublicKey(aliceId, networkId)
    ).toString();

    const nonce = (await aliceAccount.getAccessKeys())
      .find((k) => k.public_key === signerPublicKey)
      .access_key.nonce.toString();

    expect(nonce).is.not.null;

    const account = Buffer.from(JSON.stringify({ id: aliceId, nonce }));

    const signature_data = await signer.signMessage(
      account,
      aliceId,
      networkId
    );

    const publicKey = Buffer.from(signature_data.publicKey.toString());
    const signature = Buffer.from(signature_data.signature);

    const credentials = Buffer.from(
      JSON.stringify({
        account: account.toString('base64'),
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

    const x_auth_token = response.headers['x-auth-token'];
    const payload = jwt.verify(x_auth_token, JWT_PUBLIC_KEY);
    expect(payload).not.null;
    expect(payload.sub).to.be.equal(aliceId);
    expect(payload.exp - payload.nbf).to.be.equal(60 * 60);
    expect(payload.iss).to.not.be.empty;
    expect(payload.aud).to.not.be.empty;
    expect(payload.sub).to.be.equal(payload.customer);
    expect(payload.subscription).to.be.equal('unknown');

    const x_storage_url = response.headers['x-storage-url'];
    expect(x_storage_url).is.not.undefined;
    expect(x_storage_url).contains(`http://localhost:5002/v1/${aliceId}`);
  });
});
