const gulp = require('gulp');
const { spawn } = require("child_process");


module.exports.start = async () => {
  global.nodeProc = spawn('node', ['server']);

  /*** EVENTS ***/
  global.nodeProc.stdout.on('data', async dataBuff => {
    const dataStr = dataBuff.toString().replace(/\n$/, '');
    console.log(dataStr);
  });

  global.nodeProc.stderr.on('data', dataBuff => {
    const dataStr = dataBuff.toString().replace(/\n$/, '');
    console.log(`\x1b[31mstderr: ${dataStr}\x1b[0m`);
  });

  global.nodeProc.on('error', error => {
    console.log(`\x1b[31merror: ${error.message}\x1b[0m`);
    module.exports.stop();
    process.exit();
  });

  global.nodeProc.on('close', code => {
    // console.log(`  - The "node server" child process exited with code ${code}`);
  });

};




module.exports.stop = async () => {
  if (!!global.nodeProc) { global.nodeProc.kill('SIGINT'); }
}



module.exports.restart = async () => {
  await module.exports.stop();
  await module.exports.start();
}
