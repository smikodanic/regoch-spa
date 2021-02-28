const Sys = require('../../sys');

class App {

  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
  }

}




window.app = new App();
const system = new Sys(window.app);
system.run();
