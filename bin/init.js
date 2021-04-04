const path = require('path');
const fse = require('fs-extra');


module.exports = async (appName) => {

  try {
    // destination directory
    const destDir = path.join(process.cwd(), appName);
    await fse.ensureDir(destDir);

    // copy files from the /template/ folder to /appName/ folder
    const sourceTemplate = path.join(__dirname, 'template');
    await fse.copy(sourceTemplate, destDir);

    // rename gitignore (npm does not publish task_template/.gitignore so task_template/gitignore is used)
    const gitignore_old = path.join(destDir, 'gitignore');
    const gitignore_new = path.join(destDir, '.gitignore');
    await fse.rename(gitignore_old, gitignore_new);

    // copy .gulp folder
    const sourceGulp = path.join(__dirname, '../.gulp');
    const destGulp = path.join(destDir, '.gulp');
    await fse.copy(sourceGulp, destGulp);


    // copy other files
    const files = ['.editorconfig', '.eslintrc', 'gulpfile.js'];
    for (const file of files) {
      const sourceFile = path.join(__dirname, `../${file}`);
      const destFile = path.join(destDir, file);
      await fse.copy(sourceFile, destFile);
    }

    // create package.json
    const package_json_obj = {
      'name': appName.toLowerCase(),
      'version': '1.0.0',
      'title': appName,
      'description': '',
      'author': '',
      'homepage': '',
      'license': 'MIT',
      'keywords': [ appName ],
      'main': '',
      'scripts': {
        'inst': 'rm -rf node_modules && npm install',
        'dev': 'gulp default',
        'build': 'npm install && gulp build && rm -rf node_modules && npm install --only=production'
      },
      'dependencies': {
        'regoch-router': '^1.0.1',
        'regoch-spa': '^1.0.0'
      },
      'devDependencies': {
        'browserify': '^17.0.0',
        'commander': '^7.2.0',
        'fs-extra': '^9.1.0',
        'gulp': '^4.0.2',
        'gulp-autoprefixer': '^7.0.1',
        'gulp-cssmin': '^0.2.0',
        'gulp-header': '^2.0.9',
        'gulp-htmlmin': '^5.0.1',
        'gulp-minify': '^3.1.0',
        'gulp-sass': '^4.1.0',
        'gulp-sourcemaps': '^3.0.0',
        'inquirer': '^8.0.0',
        'rimraf': '^3.0.2',
        'vinyl-buffer': '^1.0.1',
        'vinyl-source-stream': '^2.0.0'
      }
    };
    const package_json = JSON.stringify(package_json_obj, null, 2);
    const package_json_path = path.join(destDir, 'package.json');
    await fse.writeFile(package_json_path, package_json, {encoding: 'utf8'});


    // ending message
    const tf = await fse.pathExists(destDir);
    if (tf) { console.log(`Task "${appName}" initialized and folder is created.\nModify package.json, README.md, LICENSE and the app files.`); }

  } catch (err) {
    console.error(err);
  }

};
