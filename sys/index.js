const HTTPServer = require('./server/HTTPServer');

const App = require('./App');
const Controller = require('./mvc/Controller');
const syslib = require('./lib');


module.exports = {
  HTTPServer,

  App,
  Controller,
  syslib
};
