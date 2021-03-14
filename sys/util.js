class Util {

  constructor() {
    this.separator = '@@',
    this.debug = {
      rgKILL: false,
      rgHref: false,
      rgClick: false,
      rgPrint: false,
      rgSet: false,
      loadView: false
    };
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @returns {void}
   */
  debugger(tip, text, color, background) {
    if (this.debug[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
  }

}


module.exports = new Util();
