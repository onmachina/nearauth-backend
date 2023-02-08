'use strict';

const express = require('express');
const nearAPI = require('near-api-js');
const sha256 = require('js-sha256').sha256;

const logger = require('./logger');

const {
  methodNotAllowed,
  BadRequestError,
  UnauthenticatedError,
} = require('./errors');

const configSandbox = {
  networkId: 'sandbox',
  nodeUrl: 'http://0.0.0.0:3030',
};

const configTestnet = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
};

const configMainnet = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
};

const config =
  process.env.NEAR_ENV == 'mainnet'
    ? configMainnet
    : process.env.NEAR_ENV == 'testnet'
    ? configTestnet
    : configSandbox;

const login = async (req, res) => {
  const user = req.header('x-auth-user');
  const base64auth = req.header('x-auth-key');

  if (!user || !base64auth) {
    throw new BadRequestError();
  }

  const auth = JSON.parse(Buffer.from(base64auth, 'base64').toString('ascii'));

  const identity = Buffer.from(auth.identity, 'base64').toString('ascii');
  const publicKey = Buffer.from(auth.publicKey, 'base64').toString('ascii');
  const signature = Buffer.from(auth.signature, 'base64');

  logger.debug('Authentication request:', identity, publicKey, signature);

  const verificationKey = nearAPI.utils.PublicKey.fromString(publicKey);
  const signedData = Buffer.from(sha256.array(Buffer.from(identity)));

  if (!verificationKey.verify(signedData, signature)) {
    throw new UnauthenticatedError('Signature is not valid');
  }

  const near = await nearAPI.connect(config);
  const account = new nearAPI.Account(near.connection, identity);
  const accessKeys = await account.getAccessKeys();

  if (!accessKeys.find((k) => k.public_key === publicKey)) {
    throw new UnauthenticatedError("Public key doesn't belong to the account");
  }

  res.send();
};

const router = express.Router();

// GET method is compatible with Swift /auth/v1.0.
router.route('/').get(login).all(methodNotAllowed);

module.exports = router;
