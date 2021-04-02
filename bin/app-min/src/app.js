const { App } = require('../../sys');

// conf
const routesCnf = require('./conf/routesCnf');

// lib
const StringExt = require('./lib/StringExt');

// controllers
const HomeCtrl = require('./controllers/HomeCtrl');
const NotfoundCtrl = require('./controllers/NotfoundCtrl');



const app = new App();

app
  .const('myNum', 10)
  .freeze();

app.libInject({StringExt});

app
  .controller([
    HomeCtrl,
    NotfoundCtrl
  ])
  .routes(routesCnf).run();



