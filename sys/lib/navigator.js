const eventEmitter = require('./eventEmitter');


/**
 * Navigate to certain URL by changing browser's address bar data.
 */
class Navigator {

  constructor() {
    this.previous = {};
    this.current = {};
  }

  /********** SETTERS & GETTERS ********/
  /**
   * Set current uri and controller.
   * @param {Controller} ctrl - instance of the current controller
   * @param {{uri:string, body:any, params:object, query:object, routeParsed:object, uriParsed:object}} trx - regoch-router transitional variable for matched route
   */
  setCurrent(ctrl, trx) {
    const uri = this.getCurrentURI();
    this.current = {uri, ctrl};
  }


  /**
   * Set previous uri and controller.
   */
  setPrevious() {
    this.previous = this.current;
  }


  /**
   * Get the current URI. The uri is path + query string, without hash, for example: /page1.html?q=12
   * @returns {string}
   */
  getCurrentURI() {
    return window.location.pathname + window.location.search;
  }




  /************ NAVIGATION ************/
  /**
   * Navigates to a view using an absolute URL path.
   * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
   * @param {string} url - absolute URL path, /customer/product/25?limit=25
   * @param {any} state - the state data. Fetch it with event.detail
   * @param {string} title
   */
  goto(url, state, title) {
    if (!url) { throw new Error('The argument "url" is not defined'); }
    if (!state) { state = {}; }
    if (!title) { title = ''; }

    state = {...state, url};

    window.history.pushState(state, title, url); // change URL in the browser address bar
    eventEmitter.emit('pushstate', state); // pushstate event to activate controller in the router.js
  }


  /**
   * Go forward like forward button is clicked.
   */
  forward() {
    window.history.forward();
  }

  /**
   * Go back like back button is clicked.
   */
  back() {
    window.history.back();
  }

  /**
   * Loads a specific page from the session history.
   * You can use it to move forwards and backwards through the history depending on the delta value.
   * @param {number} delta - history index number, for example: -1 is like back(), and 1 is like forward()
   */
  go(delta) {
    window.history.go(delta);
  }

  /**
   * Reloads the page like refresh button is clicked.
   */
  reload() {
    window.location.reload();
  }




  /********** EVENT LISTENERS ************/
  /**
   * Listen for the 'pushstate' event.
   * The pushstate hapen when element with data-rg-href attribute is clicked.
   * @param {Function} listener - callback function with event parameter, for example pevent => { ... }
   * @returns {void}
   */
  onPushstate(listener) {
    eventEmitter.on('pushstate', listener);
  }


  /**
   * Listen for the 'popstate' event.
   * The popstate event is fired each time when the current history entry changes (user navigates to a new state).
   * That happens when user clicks on browser's Back/Forward button or when history.back(), history.forward(), history.go() methods are programatically called.
   * The event.state is property of the event is equal to the history state object.
   * @param {Function} listener - callback function with event parameter, for example pevent => { ... }
   * @returns {void}
   */
  onPopstate(listener) {
    window.addEventListener('popstate', listener);
  }


  /**
   * Listen for the URL changes.
   * The URL is contained of path and search query but without hash, for example: /page1.html?q=12.
   * @param {Function} listener - callback function with event parameter, for example pevent => { ... }
   * @returns {void}
   */
  onUrlChange(listener) {
    this.onPushstate(listener);
    this.onPopstate(listener);
  }


  /**
   * Listen for the 'hashchange' event.
   * This happens when window.location.hash is changed. For example /product#image --> /product#description
   * @param {Function} listener - callback function with event parameter, for example pevent => { ... }
   * @returns {void}
   */
  onHashchange(listener) {
    window.addEventListener('hashchange', listener);
  }


}


module.exports = new Navigator();
