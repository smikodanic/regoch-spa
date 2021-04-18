/**
 * Create env /app/src/env.json file from /env/index.js.
 */
const fse = require('fs-extra');
const path = require('path');

module.exports = async () => {
  const cwd = process.cwd();
  const envPath = path.join(cwd, 'env/index.js');
  const env = require(envPath);

  const fileDest = path.join(cwd, 'app/src/env.json');
  await fse.ensureFile(fileDest);
  await fse.writeFile(fileDest, JSON.stringify(env, null, 2), {encoding: 'utf8'});

  delete require.cache[envPath];

  console.log('👌  Created environment file "app/src/env.js":', env);
}
