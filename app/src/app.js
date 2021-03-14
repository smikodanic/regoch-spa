const App = require('../../sys').App;
const appconf = require('./config/appconf');
const router = require('./config/routes');
console.log('router::', router);

const app = new App(appconf);
app.use(router);

