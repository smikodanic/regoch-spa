const regochJson = require('../regoch.json');

const env = process.env.NODE_ENV || regochJson.env || 'development';
const envFile = `${process.cwd()}/env/${env}.js`;

const envJs = require(envFile);
delete require.cache[envFile];

module.exports = envJs;
