const RegochSPA = require('./RegochSPA');
const routes = require('../app/src/config/routes');


const regochSPA = new RegochSPA();

routes(regochSPA); // load routes

regochSPA.run(); // initialise the app

