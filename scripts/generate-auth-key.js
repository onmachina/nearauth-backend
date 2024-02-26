#!/usr/bin/env node

'use strict';
const nearAPI = require('near-api-js');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const generate_auth_token = async (accountId, networkId) => {
  let nodeUrl;
  if (networkId === 'sandbox') {
    nodeUrl = `http://localhost:3030`;
  } else {
    nodeUrl = `https://rpc.${networkId}.near.org`;
  }
  const keyFileName = `${require('os').homedir()}/.near-credentials/${networkId}/${accountId}.json`;

  let keyFile;

  try {
    keyFile = require(keyFileName);
  } catch (err) {
    console.error(
      `Account ${accountId} is not found for the ${networkId}. Please, login with near CLI and try again.`
    );
    console.error(`File not found: ${keyFileName}.`);
    process.exit(1);
  }

  const privKey = nearAPI.utils.KeyPair.fromString(
    keyFile.secret_key || keyFile.private_key
  );

  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  keyStore.setKey(networkId, accountId, privKey);

  const near = await nearAPI.connect({ keyStore, networkId, nodeUrl });

  const signer = near.connection.signer;

  const signerPublicKey = (
    await signer.getPublicKey(accountId, networkId)
  ).toString();

  const account = new nearAPI.Account(near.connection, accountId);

  const nonce = (await account.getAccessKeys())
    .find((k) => k.public_key === signerPublicKey)
    .access_key.nonce.toString();

  const accountData = Buffer.from(JSON.stringify({ id: accountId, nonce }));
  const signatureData = await signer.signMessage(
    accountData,
    accountId,
    networkId
  );

  const publicKey = Buffer.from(signatureData.publicKey.toString());
  const signature = Buffer.from(signatureData.signature);

  const credentials = Buffer.from(
    JSON.stringify({
      account: accountData.toString('base64'),
      publicKey: publicKey.toString('base64'),
      signature: signature.toString('base64'),
    })
  ).toString('base64');

  console.log(credentials);
};

(async function () {
  yargs(hideBin(process.argv))
    .usage('Usage: $0 <accountId> [--networkId <sandbox|testnet|mainnet>]')
    .command(
      '$0 <accountId>',
      'generate an authentication JWT token',
      (yargs) => {
        return yargs.positional('accountId', {
          describe: 'NEAR account identifier',
          type: 'string',
        });
      },
      async (argv) => {
        await generate_auth_token(argv.accountId, argv.networkId);
      }
    )
    .option('networkId', {
      describe: 'NEAR network',
      choices: ['sandbox', 'testnet', 'mainnet'],
      default: 'testnet',
    })
    .parse();
})();
