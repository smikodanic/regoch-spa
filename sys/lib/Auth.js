const HTTPClient = require('./HTTPClient');
const Cookie = require('./Cookie');
const navigator = require('./navigator');



/**
 * Authentication with the JWT token and cookie setup.
 */
class Auth {

  /**
   * opts:
   {
    optsHttpClient :object,  // HTTPClient options
    optsCookie :object,     // Cookie options
    apiLogin :string,       // API login URL: http://127.0.0.1:8001/users/login
    afterGoodLogin :string, // redirect after succesful login: '/{loggedUserRole}'
    afterBadLogin :string,  // redirect after unsuccesful login: '/login'
    afterLogout :string     // URL after logout: '/login'
   * @param {object} opts - auth options
   */
  constructor(opts) {
    this.jwtToken; // JWT Token string: 'JWT ...'
    this.loggedUser; // the user object: {first_name, last_name, username, ...}

    if (!opts.optsHttpClient) {
      opts.optsHttpClient = {
        encodeURI: true,
        timeout: 21000,
        retry: 0,
        retryDelay: 1300,
        maxRedirects: 0,
        headers: {
          'authorization': '',
          'accept': 'application/json',
          'content-type': 'application/json; charset=utf-8'
        }
      };
    }
    this.httpClientLib = new HTTPClient(opts.optsHttpClient);

    if (!opts.optsCookie) {
      opts.optsCookie = {
        // domain: 'localhost',
        path: '/',
        expires: 5, // number of days or exact date
        secure: false,
        httpOnly: false,
        sameSite: 'strict' // 'strict' for GET and POST, 'lax' only for POST
      };
    }
    this.cookieLib = new Cookie(opts.optsCookie);

    this.opts = opts;
  }


  /**
   * Send login request to the API.
   * @param {object} creds - credentials object send as body to the API, for example: {username, password}
   * @returns {Promise<any>}
   */
  async login(creds) {
    const url = this.opts.apiLogin;
    const answer = await this.httpClientLib.askJSON(url, 'POST', creds);

    if (answer.status === 200) {
      const apiResp = answer.res.content;

      this.jwtToken = apiResp.jwtToken;
      this.loggedUser = apiResp.loggedUser;

      this.cookieLib.putObject('auth_jwtToken', apiResp.jwtToken); // set cookie 'auth_jwtToken': 'JWT xyz...'
      this.cookieLib.putObject('auth_loggedUser', apiResp.loggedUser); // set cookie 'auth_loggedUser' and class property 'this.loggedUser': {first_name: , last_name: , ...}

      // redirect to URL
      const afterGoodLoginURL = this.opts.afterGoodLogin.replace('{loggedUserRole}', apiResp.loggedUser.role);
      navigator.goto(afterGoodLoginURL);

      return apiResp;

    } else {
      this.loggedUser = null;
      this.cookieLib.removeAll();
      throw new Error(answer.res.content.message);
    }

  }


  /**
   * Logout. Remove login cookie, loggedUser and change the URL.
   * @param {number} ms - time period to redirect to afterLogoutURL
   * @returns {void}
   */
  async logout(ms) {
    this.cookieLib.removeAll(); // delete all cookies
    this.loggedUser = undefined; // remove class property
    await new Promise(r => setTimeout(r, ms));
    navigator.goto(this.opts.afterLogout); // change URL
  }


  /**
   * Get logged user info (from the object property or cookie 'auth_loggedUser')
   * @returns {object} - {first_name, last_name, ...}
   */
  getLoggedUserInfo() {
    const loggedUser = this.loggedUser || this.cookieLib.getObject('auth_loggedUser');
    return loggedUser;
  }


  /**
   * Get JWT token from cookie
   * @return string - JWT eyJhbGciOiJIUzI1NiIsInR...
   */
  getJWTtoken() {
    const jwtToken = this.jwtToken || this.cookieLib.get('auth_jwtToken');
    return jwtToken;
  }



  /**
   * Check if user is logged and if yes do auto login e.g. redirect to afterGoodLogin URL.
   * @returns {void}
   */
  autoLogin() {
    const loggedUser = this.getLoggedUserInfo(); // get loggedUser info after successful username:password login

    // redirect to URL
    if (!!loggedUser && !!loggedUser.username) {
      const afterGoodLoginURL = this.opts.afterGoodLogin.replace('{loggedUserRole}', loggedUser.role);
      navigator.goto(afterGoodLoginURL);
    }
  }



  /**
   * Check if user has required role: admin, customer... which corresponds to the URL.
   * For example role "admin" must have URL starts with /admin/...
   * If not redirect to /login page.
   * @returns {boolean}
   */
  hasRole() {
    const loggedUser = this.authService.getLoggedUserInfo(); // get loggedUser info after successful username:password login

    // get current URL and check if user's role (admin, customer) is contained in it
    const currentUrl = window.location.pathname + window.location.search; // browser address bar URL: /admin/product/23

    let tf = false;
    if (!!loggedUser && !!loggedUser.role) {
      tf = currentUrl.indexOf(loggedUser.role) !== -1;
    }

    if (!tf) {
      navigator.goto(this.opts.afterBadLogin);
      console.error('This route is blocked because user doesn\'t have good role. The route is redirected.');
    }

    return tf;
  }



  /**
   * Check if user is logged and if not redirect to afterBadLogin URL.
   * @returns {boolean}
   */
  isLogged() {
    const loggedUser = this.authService.getLoggedUserInfo(); // get loggedUser info after successful username:password login
    const isAlreadyLogged = !!loggedUser && !!loggedUser.username;

    // redirect to afterBadLogin URL
    if (!isAlreadyLogged) {
      navigator.goto(this.opts.afterBadLogin);
      console.error('This route is blocked because user doesn\'t have good role. The route is redirected.');
    }

    return isAlreadyLogged;
  }



}



module.exports = Auth;
