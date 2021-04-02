#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');

const args = process.argv;


const init = require('./init.js');



// program
//   .storeOptionsAsProperties(false)
//   .passCommandToAction(false);


/**
 * Get rg version.
 * $rg -v
 */
program
  .version(pkg.version)
  .option('-v --version', 'Print dex8 version.');



/**
 * Initialize new Regoch SPA by coping folder "rg_template".
 * $rg init <appName>
 */
program
  .command('init <appName>')
  .description('Initialize new application. Creates the folder structure with initial files.')
  .action(init);




program.parse(args);
