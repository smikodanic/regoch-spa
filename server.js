const SPAserver = require('single-page-app-server');

const httpOpts = {
  port: 4520,
  timeout: 0, // if 0 never timeout
  staticDir: '/dist',
  indexFile: 'index.html',
  acceptEncoding: 'deflate', // gzip, deflate or ''
  headers: {
    // CORS Headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET', // 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD',
    'Access-Control-Max-Age': '3600'
  },
  debug: false
};

const spaServer = new SPAserver(httpOpts);
spaServer.start();
