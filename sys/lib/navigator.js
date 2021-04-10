const eventEmitter = require('./eventEmitter');


/**
 * Navigate to certain URL by changing browser's address bar.
 */
class Navigator {


  /**
   * Navigates to a view using an absolute URL path.
   * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
   * @param {string} url - absolute URL path
   * @param {any} state - fetch it with event.detail
   * @param {string} title
   */
  goto(url, state, title) {
    if (!url) { throw new Error('The argument "url" is not defined'); }
    if (!state) { state = {}; }
    if (!title) { title = ''; }

    state = {...state, url};

    window.history.pushState(state, title, url);
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
   *  Loads a specific page from the session history.
   * You can use it to move forwards and backwards through the history depending on the delta value.
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


  /**
   * Listen for the 'pushstate' event.
   * @param {Function} listener - callback function with event parameter
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
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  onPopstate(listener) {
    window.addEventListener('popstate', listener);
  }


}


module.exports = new Navigator();
