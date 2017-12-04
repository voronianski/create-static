#!/usr/bin/env node

const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const core = require('../src/core');

const optimist = require('optimist')
  .usage('\nUsage: create-client -s ./path/to/src -o ./path/to/dist')
  .alias('source', 's')
  .alias('output', 'o')
  .alias('help', 'h')
  .alias('version', 'v')
  .describe('source', 'path to source folder containing all page folders')
  .describe('output', 'path to dist folder with resulted builds')
  .describe('help', 'print help')
  .describe('version', 'print version');
const argv = optimist.argv;

if (argv.help || argv.h) {
  optimist.help();
  optimist.showHelp();
  return;
}

if (argv.version || argv.v) {
  const version = fs.readJSONSync(path.join(__dirname, '../package.json')).version;

  console.info(version);
  return;
}

const spinner = ora({color: 'yellow'});
const source = argv.source || argv.s;
const output = argv.output || argv.o;

spinner.start(`Building clients from ${source}!`);

core.run({ source, output })
  .then(() => {
    spinner.succeed(`Success all builds are ready in ${output}!`);
  })
  .catch(err => {
    spinner.fail('Building clients failed because of error 👇');
    console.log(err);
  });
