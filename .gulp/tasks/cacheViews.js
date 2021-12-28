/**
 * Bundle HTML views in one JS file.
 */
const fse = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier'); // https://github.com/kangax/html-minifier


module.exports = async () => {
  const cwd = process.cwd();
  const regochJsonPath = path.join(cwd, 'regoch.json');
  const regochJson = require(regochJsonPath);
  const files = regochJson.cache.views;

  let views = {};
  for (const file of files) {
    const filepath = path.join(cwd, 'client/src/views', file);
    if (!await fse.pathExists(filepath)) { throw new Error(`File defined in the regoch.json "${filepath}" doesn't exist.`) }
    let content = await fse.readFile(filepath, { encoding: 'utf8' });
    content = minify(content, { collapseWhitespace: true })
    views[file] = content;
  }

  const fileDest = path.join(cwd, 'client/_cache/views.json');
  await fse.ensureFile(fileDest);
  await fse.writeFile(fileDest, JSON.stringify(views, null, 2), { encoding: 'utf8' });

  delete require.cache[regochJsonPath];

  console.log('👌  Cached views to "client/_cache/views.json":\n', files);
}

