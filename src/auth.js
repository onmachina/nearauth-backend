'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const nearAPI = require('near-api-js');
const sha256 = require('js-sha256').sha256;

const env = require('./env');
const logger = require('./logger');

const {
  methodNotAllowed,
  BadRequestError,
  UnauthenticatedError,
} = require('./errors');

const JWT_PRIVATE_KEY = fs.readFileSync(env.PRIVATE_KEY_PATH);
const JWT_ALG = 'ES256';
const JWT_LIFETIME = 60 * 60; // 60 minutes
const JWT_KID = 'ef3f9a6b3681ba62e5ea'; // same as ./.well-known/jwks.json

const configSandbox = {
  networkId: 'sandbox',
  nodeUrl: 'http://0.0.0.0:3030',
  contractId: '',
};

const configTestnet = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  machinaId: 'dev-1684076402429-48753957150583',
};

const configMainnet = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  machinaId: '',
};

const config =
  env.NEAR_ENV == 'mainnet'
    ? configMainnet
    : env.NEAR_ENV == 'testnet'
    ? configTestnet
    : configSandbox;

const login = async (req, res) => {
  const user = req.header('x-auth-user');
  const base64auth = req.header('x-auth-key');

  if (!user || !base64auth) {
    throw new BadRequestError();
  }

  const auth = JSON.parse(Buffer.from(base64auth, 'base64').toString('ascii'));

  const account = Buffer.from(auth.account, 'base64').toString('ascii');
  const publicKey = Buffer.from(auth.publicKey, 'base64').toString('ascii');
  const signature = Buffer.from(auth.signature, 'base64');

  logger.debug(`Authentication request: ${account}, ${publicKey}`);

  const verificationKey = nearAPI.utils.PublicKey.fromString(publicKey);
  const signedData = Buffer.from(sha256.array(Buffer.from(account)));

  if (!verificationKey.verify(signedData, signature)) {
    throw new UnauthenticatedError('Signature is not valid');
  }

  const accountDetails = JSON.parse(account);

  const near = await nearAPI.connect(config);
  const nearAccount = new nearAPI.Account(near.connection, accountDetails.id);

  const accessKey = (await nearAccount.getAccessKeys()).find(
    (k) => k.public_key === publicKey
  );

  if (!accessKey) {
    throw new UnauthenticatedError("Public key doesn't belong to the account");
  }

  if (accessKey.access_key.nonce.toString() != accountDetails.nonce) {
    throw new UnauthenticatedError('Nonce is outdated');
  }

  let role = 'user';

  // URI: /api/v1/:node
  if (req.params.node == 'node') {
    const contract = new nearAPI.Contract(nearAccount, config.machinaId, {
      viewMethods: ['node_info'],
    });

    const info = await contract.node_info({ node_id: accountDetails.id });

    if (Object.keys(info).length === 0) {
      throw new UnauthenticatedError("Node doesn't have a deposit");
    }

    role = 'node';
  }

  const auth_token = jwt.sign({ role }, JWT_PRIVATE_KEY, {
    subject: nearAccount.accountId,
    algorithm: JWT_ALG,
    notBefore: 0,
    expiresIn: JWT_LIFETIME,
    issuer: env.ISSUER,
    audience: env.AUDIENCE,
    keyid: JWT_KID,
  });

  logger.info(`Authenticated as ${role}: ${nearAccount.accountId}`);

  const scheme = req.header('x-forwarded-proto') || req.protocol || 'https';
  const storage_url = `${scheme}://${env.SERVER_STORAGE_DOMAIN}/v1/${nearAccount.accountId}`;

  res.header('x-auth-token', auth_token);
  res.header('x-storage-url', storage_url);
  res.send();
};

const router = express.Router();

// GET method is compatible with Swift /auth/v1.0.
router.route('/').get(login).all(methodNotAllowed);
router.route('/:node').get(login).all(methodNotAllowed);

module.exports = router;
