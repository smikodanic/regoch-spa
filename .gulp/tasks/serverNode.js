const gulp = require('gulp');
const { spawn } = require("child_process");


module.exports.start = async () => {
  global.nodeProc = spawn('node', ['server']);


  /*** EVENTS ***/
  global.nodeProc.stdout.on('data', async dataBuff => {
    const dataStr = dataBuff.toString();
    if (!!dataStr) {
      await new Promise(resolve => setTimeout(resolve, 3400));
      console.log(dataStr);
    }

  });

  global.nodeProc.stderr.on('data', dataBuff => {
    console.log(`stderr: ${dataBuff}`);
    if (/is already in use/i.test(dataBuff.toString())) {
      spawn('killall', ['-9v', 'node']);
      console.log('😒  Killed all nodejs processes!');
      module.exports.start();
    }
  });

  global.nodeProc.on('error', (error) => {
    console.log(`error: ${error.message}`);
    module.exports.stop();
    process.exit();
  });

  global.nodeProc.on('close', code => {
    // console.log(`child process exited with code ${code}`);
  });

};




module.exports.stop = async () => {
  global.nodeProc.kill('SIGINT');
}



module.exports.restart = async () => {
  await module.exports.stop();
  await module.exports.start();
}



/*** exit with CTRL+c ***/
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.on('data', async data => {
  // console.log(data); // hex binary
  if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log('\n💥  Server process is killed !\n');
    module.exports.stop();
    await new Promise(resolve => setTimeout(resolve, 400));
    process.exit();
  } else if (data.length === 1 && data[0] === 0x0d) { // 0x0d is Enter
    console.log('☺'); // https://unicode.org/emoji/charts/full-emoji-list.html
  }
});
