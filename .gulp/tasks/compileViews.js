/**
 * Bundle HTML views in the one JS file.
 */
const fse = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier'); // https://github.com/kangax/html-minifier
const regochJson = require('../../regoch.json');

module.exports = async () => {
  const files = regochJson.compile.views;
  const cwd = process.cwd();

  let views = {};
  for (const file of files) {
    const filepath = path.join(cwd, 'app/src/views', file);
    let content = await fse.readFile(filepath, {encoding: 'utf8'});
    content = minify(content, {collapseWhitespace: true})
    views[file] = content;
  }

  // console.log(views);

  const fileDest = path.join(cwd, 'app/dist/views/compiled.json');
  await fse.ensureFile(fileDest);
  await fse.writeFile(fileDest, JSON.stringify(views, null, 2), {encoding: 'utf8'});


}

