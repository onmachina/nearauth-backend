const nearAPI = require('near-api-js');
const BN = require('bn.js');
const portUsed = require('port-used');

process.env.NEAR_NO_LOGS = 'defined';

const SANDBOX_PATH = process.env.SANDBOX_PATH || '/tmp/near-auth-test-sandbox';
const SANDBOX_PORT = process.env.SANDBOX_PORT || 3030;

const config = {
  sandboxDomain: '0.0.0.0',
  sandboxPort: SANDBOX_PORT,
  sandboxPath: SANDBOX_PATH,
  sandboxNetworkId: 'sandbox',
  sandboxKeypath: `${SANDBOX_PATH}/validator_key.json`,
  sandboxAmount: new BN('300000000000000000000000000', 10), // 26 digits, 300 NEAR
  masterId: 'test.near',
  aliceId: 'alice.test.near',
};

async function sandboxSetup() {
  portUsed.check(config.sandboxPort, config.sandboxDomain).then(
    (inUse) => {
      if (!inUse) {
        throw new Error('Run NEAR sandbox first: `npm run sandbox`!');
      }
    },
    (err) => {
      console.error('Error on check:', err.message);
    }
  );

  const keyFile = require(config.sandboxKeypath);
  const privKey = nearAPI.utils.KeyPair.fromString(keyFile.secret_key);
  const pubKey = nearAPI.utils.PublicKey.fromString(keyFile.public_key);

  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  keyStore.setKey(config.sandboxNetworkId, config.masterId, privKey);

  const near = await nearAPI.connect({
    keyStore,
    networkId: config.sandboxNetworkId,
    nodeUrl: 'http://' + config.sandboxDomain + ':' + config.sandboxPort,
  });

  let masterAccount = new nearAPI.Account(near.connection, config.masterId);

  // Create test accounts.
  await masterAccount.createAccount(
    config.aliceId,
    pubKey,
    config.sandboxAmount
  );
  keyStore.setKey(config.sandboxNetworkId, config.aliceId, privKey);
  const aliceAccount = new nearAPI.Account(near.connection, config.aliceId);

  global.aliceAccount = aliceAccount;
}

async function sandboxTeardown() {}

module.exports = { sandboxSetup, sandboxTeardown };

module.exports.mochaHooks = {
  beforeAll: async function () {
    this.timeout(50000);
    await sandboxSetup();
  },
  afterAll: async function () {
    this.timeout(10000);
    await sandboxTeardown();
  },
};
