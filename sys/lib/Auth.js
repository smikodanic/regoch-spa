const HTTPClient = require('./HTTPClient');
const Cookie = require('./Cookie');
const navig = require('./navig');



/**
 * Authentication with the JWT token and cookie.
 */
class Auth {

  /**
   * authOpts:
   {
    apiLogin :string,       // API login URL: http://127.0.0.1:8001/users/login
    afterGoodLogin :string, // redirect after succesful login: '/{loggedUserRole}'
    afterBadLogin :string,  // redirect after unsuccesful login: '/login'
    afterLogout :string     // URL after logout: '/login'
   }
   * @param {object} authOpts - auth options
   * @param {Cookie} cookie - Cookie class instance
   * @param {HTTPClient} httpClient - HTTPClient class instance
   */
  constructor(authOpts, cookie, httpClient) {
    this.authOpts = authOpts;
    this.cookieLib = cookie;
    this.httpClientLib = httpClient;

    this.jwtToken; // JWT Token string: 'JWT ...'
    this.loggedUser; // the user object: {first_name, last_name, username, ...}
  }




  /******* CONTROLLER METHODS - use in the controller's constructor as app.auth() ******/
  /**
   * Send login request to the API.
   * @param {object} creds - credentials object send as body to the API, for example: {username, password}
   * @returns {Promise<any>}
   */
  async login(creds) {
    const url = this.authOpts.apiLogin;
    const answer = await this.httpClientLib.askJSON(url, 'POST', creds);

    if (answer.status === 200) {
      const apiResp = answer.res.content;

      this.jwtToken = apiResp.jwtToken;
      this.loggedUser = apiResp.loggedUser;

      this.cookieLib.put('auth_jwtToken', apiResp.jwtToken); // set cookie 'auth_jwtToken': 'JWT xyz...'
      this.cookieLib.putObject('auth_loggedUser', apiResp.loggedUser); // set cookie 'auth_loggedUser' and class property 'this.loggedUser': {first_name: , last_name: , ...}

      // redirect to URL
      const afterGoodLoginURL = this.authOpts.afterGoodLogin.replace('{loggedUserRole}', apiResp.loggedUser.role);
      navig.goto(afterGoodLoginURL);

      return apiResp;

    } else {
      this.loggedUser = null;
      this.cookieLib.removeAll();
      const errMSg = !!answer.res.content ? answer.res.content.message : 'No answer from the server. Probably the API server is down.';
      throw new Error(errMSg);
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
    navig.goto(this.authOpts.afterLogout); // change URL
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
   * @return {string} - JWT eyJhbGciOiJIUzI1NiIsInR...
   */
  getJWTtoken() {
    const jwtToken = this.jwtToken || this.cookieLib.get('auth_jwtToken');
    return jwtToken;
  }





  /******* ROUTER METHODS (use in the router as authGuards) ******/
  /**
   * Check if user is logged and if yes do auto login e.g. redirect to afterGoodLogin URL.
   * @returns {boolean}
   */
  autoLogin() {
    const loggedUser = this.getLoggedUserInfo(); // get loggedUser info after successful username:password login

    // redirect to URL
    if (!!loggedUser && !!loggedUser.username) {
      const afterGoodLoginURL = this.authOpts.afterGoodLogin.replace('{loggedUserRole}', loggedUser.role);
      navig.goto(afterGoodLoginURL);
      console.log(`%c AuthWarn:: Autologin to ${afterGoodLoginURL} is triggered.`, `color:Maroon; background:LightYellow`);
    }
  }


  /**
   * Check if user is logged and if not redirect to afterBadLogin URL.
   * @returns {boolean}
   */
  isLogged() {
    const loggedUser = this.getLoggedUserInfo(); // get loggedUser info after successful username:password login
    const isAlreadyLogged = !!loggedUser && !!loggedUser.username;

    // redirect to afterBadLogin URL
    if (!isAlreadyLogged) {
      navig.goto(this.authOpts.afterBadLogin);
      throw new Error('AuthWarn:: This route is blocked because the user is not logged in.');
    }
  }


  /**
   * Check if user has required role: admin, customer... which corresponds to the URL.
   * For example role "admin" must have URL starts with /admin/...
   * If not redirect to /login page.
   * @returns {boolean}
   */
  hasRole() {
    const loggedUser = this.getLoggedUserInfo(); // get loggedUser info after successful username:password login

    // get current URL and check if user's role (admin, customer) is contained in it
    const currentUrl = window.location.pathname + window.location.search; // browser address bar URL: /admin/product/23

    let urlHasRole = false;
    if (!!loggedUser && !!loggedUser.role) {
      urlHasRole = currentUrl.indexOf(loggedUser.role) !== -1;
    }

    if (!urlHasRole) {
      navig.goto(this.authOpts.afterBadLogin);
      throw new Error('AuthWarn:: This route is blocked because the user doesn\'t have valid role.');
    }
  }


}



module.exports = Auth;
