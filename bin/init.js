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

    // copy server folder
    const sourceServer = path.join(__dirname, '../server');
    const destServer = path.join(destDir, 'server');
    await fse.copy(sourceServer, destServer);

    // copy other files
    const files = ['.editorconfig', '.eslintrc', 'gulpfile,js', 'LICENSE'];
    for (const file of files) {
      const sourceFile = path.join(__dirname, '../.editorconfig');
      const destFile = path.join(destDir, file);
      await fse.copy(sourceFile, destFile);
    }

    // ending message
    const tf = await fse.pathExists(destDir);
    if (tf) { console.log(`Task "${appName}" initialized and folder is created.`); }

  } catch (err) {
    console.error(err);
  }

};
