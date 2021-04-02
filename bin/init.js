const path = require('path');
const fse = require('fs-extra');


module.exports = async (projectName) => {

  try {
    // copy task_template folder projectName folder
    await fse.ensureDir(projectName);
    const sourceDir = path.join(__dirname, './task_template');
    const destDir = path.join(process.cwd(), projectName);
    await fse.copy(sourceDir, destDir);
    console.log(`Copied from ${sourceDir} to ${destDir}`);

    // rename gitignore (npm does not publish task_template/.gitignore so task_template/gitignore is used)
    const gitignore_old = path.join(destDir, 'gitignore');
    const gitignore_new = path.join(destDir, '.gitignore');
    await fse.rename(gitignore_old, gitignore_new);

    const tf = await fse.pathExists(destDir);
    if (tf) {
      console.log(`Task "${projectName}" initialized and folder is created.`);
    }


  } catch (err) {
    throw err;
  }

};
