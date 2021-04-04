const HTTPServer = require('regoch-spa');

const httpOpts = {
  port: 4400,
  timeout: 5*60*1000, // if 0 never timeout
  indexFile: '/app/dist/views/index.html',
  distDir: '/app/dist',
  assetsDir: '/app/assets',
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
