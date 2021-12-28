const { HTTPServer } = require('../sys');


const regochPath = `${process.cwd()}/regoch.json`;
const regochJson = require(regochPath);

const env = process.env.NODE_ENV || regochJson.cache.env || 'development';
const envPath = `${process.cwd()}/client/src/env/${env}.js`;
const envJs = require(envPath);


const httpOpts = {
  port: envJs.server.port,
  timeout: 5 * 60 * 1000, // if 0 never timeout
  retries: 10,
  indexFile: '/client/_dist/views/index.html',
  distDir: '/client/_dist',
  assetsDir: '/client/assets',
  acceptEncoding: 'gzip', // gzip, deflate or ''
  headers: {
    // CORS Headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET', // 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD',
    'Access-Control-Max-Age': '3600'
  },
  debug: false
};

const httpServer = new HTTPServer(httpOpts);
httpServer.start();
