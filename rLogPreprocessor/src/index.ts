#!/usr/bin/env node
import RLogProcessor from './lib/RLogProcessor';
const program = require('commander');
const fs = require('fs');
const inspect = require('util').inspect;

console.log(`Running`);

program
  .version('0.0.1')
  .description('Roku Channel Preprocessor');

program
  .command('process <config>')
  .alias('p')
  .description('process project')
  .action((sourcePath, targetPath, configFile) => {
    let config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    console.log(`Loaded config ${inspect(config)}`);
    let processor = new RLogProcessor(config);
    processor.processFiles();
  });

program.parse(process.argv);
