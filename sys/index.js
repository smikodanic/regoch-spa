const App = require('./App');
const Controller = require('./mvc/Controller');
const syslib = require('./lib');
module.exports = { App, Controller, syslib };


const HTTPServer = require('./_server/HTTPServer.js');
const ProxyServer = require('./_server/ProxyServer.js');
module.exports.server = { HTTPServer, ProxyServer };
