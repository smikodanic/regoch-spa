const { App } = require('../../sys');
const viewsCompiled = require('../dist/views/compiled.json');

// conf
const routesCnf = require('./conf/routesCnf');
const apiCnf = require('./conf/apiCnf');
const httpClientCnf = require('./conf/httpClientCnf');

// lib
const StringExt = require('./lib/StringExt');
const Rand = require('./lib/Rand');

// controllers
const HomeCtrl = require('./controllers/HomeCtrl');
const WebsocketServerCtrl = require('./controllers/WebsocketServerCtrl');
const WebsocketClientsCtrl = require('./controllers/WebsocketClientsCtrl');
const SinglePageAppCtrl = require('./controllers/SinglePageAppCtrl');
const MobileAppCtrl = require('./controllers/MobileAppCtrl');
const DatabaseCtrl = require('./controllers/DatabaseCtrl');
const RouterCtrl = require('./controllers/RouterCtrl');
const ContactCtrl = require('./controllers/ContactCtrl');
const NotfoundCtrl = require('./controllers/NotfoundCtrl');

// controllers - playground
const Page_LoadIncCtrl = require('./controllers/playground/Page_LoadIncCtrl');
const Page_LoadViewsCtrl = require('./controllers/playground/Page_LoadViewsCtrl');
const Controller_hooksCtrl = require('./controllers/playground/Controller_hooksCtrl');
const DataRgCtrl = require('./controllers/playground/DataRgCtrl');
const DataRgListenersCtrl = require('./controllers/playground/DataRgListenersCtrl');
const CookieCtrl = require('./controllers/playground/CookieCtrl');
const FormCtrl = require('./controllers/playground/FormCtrl');



const app = new App();

app
  .conf('API', apiCnf)
  .conf('httpClient', httpClientCnf)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();

app.libInject({StringExt, Rand});
app.compiled(viewsCompiled);
app
  .controller([
    // docs
    HomeCtrl,
    WebsocketServerCtrl,
    WebsocketClientsCtrl,
    SinglePageAppCtrl,
    MobileAppCtrl,
    DatabaseCtrl,
    RouterCtrl,
    ContactCtrl,

    // playground
    Page_LoadIncCtrl,
    Page_LoadViewsCtrl,
    Controller_hooksCtrl,
    DataRgCtrl,
    DataRgListenersCtrl,
    CookieCtrl,
    FormCtrl,

    // not found page
    NotfoundCtrl
  ])
  .routes(routesCnf).run();
