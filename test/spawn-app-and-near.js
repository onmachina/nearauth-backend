const exec = require('child_process').exec;
const fs = require('fs');
const sleep = require('util').promisify(setTimeout);
const kill = require('tree-kill');

// NOTE: Not cool but easy.
const logger = require('../src/logger');

let server;
let sandbox;

const mochaGlobalSetup = async () => {
  if (fs.existsSync('.env')) {
    console.log(
      'Error: .env file is present. Please remove it, because it can affect the tests.'
    );
    process.exit(1);
  }

  console.log('Start NEAR sandbox...');
  sandbox = exec('npm run sandbox');

  console.log('Start server...');
  server = exec('npm start', (_error, stdout, _stderr) => logger.debug(stdout));

  await sleep(5000);
};

const mochaGlobalTeardown = async () => {
  if (sandbox.exitCode === 1) {
    console.log('Error: NEAR sandbox failure. Probably, it failed to start.');
  }

  if (server.exitCode === 1) {
    console.log('Error: Server failure. Probably, it failed to start.');
  }

  console.log('Stop NEAR sandbox...');
  kill(sandbox.pid);

  console.log('Stop server...');
  kill(server.pid);
};

module.exports = { mochaGlobalSetup, mochaGlobalTeardown };
