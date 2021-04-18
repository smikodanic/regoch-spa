/**
 * Bundle HTML views in the one JS file.
 */
const fse = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier'); // https://github.com/kangax/html-minifier


module.exports = async () => {
  const cwd = process.cwd();
  const regochJsonPath = path.join(cwd, 'regoch.json');
  const regochJson = require(regochJsonPath);
  const files = regochJson.compile.views;

  let views = {};
  for (const file of files) {
    const filepath = path.join(cwd, 'app/src/views', file);
    if (!await fse.pathExists(filepath)) { throw new Error(`File "${filepath}" doesn't exist in regoch.json.`)}
    let content = await fse.readFile(filepath, {encoding: 'utf8'});
    content = minify(content, {collapseWhitespace: true})
    views[file] = content;
  }

  const fileDest = path.join(cwd, 'app/src/views/compiled.json');
  await fse.ensureFile(fileDest);
  await fse.writeFile(fileDest, JSON.stringify(views, null, 2), {encoding: 'utf8'});

  delete require.cache[regochJsonPath];

  console.log('👌  Views compiled to "app/src/views/compiled.json":\n', files);
}

