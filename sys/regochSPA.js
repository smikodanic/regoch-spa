const System = require('./System');
const router = require('../app/src/config/routes');


const system = new System(router);
system.run();

