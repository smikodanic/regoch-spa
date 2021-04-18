const { App, syslib } = require('../../sys');
const viewsCompiled = require('./views/compiled.json');
const routes = require('./routes');

// conf
const { apiConst, authOpts, cookieOpts, httpClientOpts } = require('./conf');

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
const Page_LazyJSCtrl = require('./controllers/playground/Page_LazyJSCtrl');
const Page_LoadIncCtrl = require('./controllers/playground/Page_LoadIncCtrl');
const Page_LoadViewsCtrl = require('./controllers/playground/Page_LoadViewsCtrl');
const Controller_hooksCtrl = require('./controllers/playground/Controller_hooksCtrl');
const DataRgCtrl = require('./controllers/playground/DataRgCtrl');
const DataRgListenersCtrl = require('./controllers/playground/DataRgListenersCtrl');
const CookieCtrl = require('./controllers/playground/CookieCtrl');
const FormCtrl = require('./controllers/playground/FormCtrl');
const LoginCtrl = require('./controllers/playground/LoginCtrl');
const LoginokCtrl = require('./controllers/playground/LoginokCtrl');
const Navig1Ctrl = require('./controllers/playground/Navig1Ctrl');
const Navig2Ctrl = require('./controllers/playground/Navig2Ctrl');


// auth
const cookie = new syslib.Cookie(cookieOpts);
const httpClient = new syslib.HTTPClient(httpClientOpts);
const auth = new syslib.Auth(authOpts, cookie, httpClient);



const app = new App();

app
  .const('apiConst', apiConst)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();

app.libInject({StringExt, Rand});

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
    Page_LazyJSCtrl,
    Page_LoadIncCtrl,
    Page_LoadViewsCtrl,
    Controller_hooksCtrl,
    DataRgCtrl,
    DataRgListenersCtrl,
    CookieCtrl,
    FormCtrl,
    LoginCtrl,
    LoginokCtrl,
    Navig1Ctrl,
    Navig2Ctrl,

    // not found page
    NotfoundCtrl
  ])
  .controllerAuth(auth) // needed for route authGuards
  .controllerViewsCompiled(viewsCompiled);

app
  .routes(routes).run();
