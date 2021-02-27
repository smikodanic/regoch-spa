const System = require('../system');

class App {

  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
  }

}




window.app = new App();
const system = new System(window.app);
system.run();
