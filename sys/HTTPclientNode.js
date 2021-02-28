/**
 * Simple for usage but powerful HTTP client.
 */
const http = require('http');
const https = require('https');
const url_node = require('url');
const zlib = require('zlib');
const pkg_json = require('../package.json');
console.log(url_node);


class HttpClient {

  /**
   * @param {Object} opts - HTTP Client options {encodeURI, timeout, retry, retryDelay, maxRedirects, headers}
   */
  constructor(opts) {
    this.url;
    this.protocol = 'http:';
    this.hostname = '';
    this.port = 80;
    this.pathname = '/';
    this.queryString = '';

    if (!opts) {
      this.opts = {
        encodeURI: false,
        timeout: 8000,
        retry: 3,
        retryDelay: 5500,
        maxRedirects: 3,
        headers: {
          'authorization': '',
          'user-agent': `DEX8-SDK/${pkg_json.version} https://dex8.com`, // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
          'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          'cache-control': 'no-cache',
          'host': '',
          'accept-encoding': 'gzip',
          'connection': 'close', // keep-alive
          'content-type': 'text/html; charset=UTF-8'
        }
      };
    } else {
      this.opts = opts;
    }

    // default request headers
    this.headers = this.opts.headers;

  }



  /********** PRIVATES *********/

  /**
   * Parse url.
   * @param {String} url - http://www.adsuu.com/some/thing.php?x=2&y=3
   */
  _parseUrl(url) {
    url = this._correctUrl(url);
    const urlObj  = new url_node.URL(url);
    this.url = url;
    this.protocol = urlObj.protocol;
    this.hostname = urlObj.hostname;
    this.port = urlObj.port;
    this.pathname = urlObj.pathname;
    this.queryString = urlObj.search;

    // debug
    /*
    console.log('this.url:: ', this.url); // http://localhost:8001/www/products?category=databases
    console.log('this.protocol:: ', this.protocol); // http:
    console.log('this.hostname:: ', this.hostname); // localhost
    console.log('this.port:: ', this.port); // 8001
    console.log('this.pathname:: ', this.pathname); // /www/products
    console.log('this.queryString:: ', this.queryString); // ?category=databases
    */

    return url;
  }


  /**
   * URL corrections
   */
  _correctUrl(url) {
    if (!url) {throw new Error('URL is not defined'); }

    // 1. trim from left and right
    url = url.trim();

    // 2. add protocol
    if (!/^https?:\/\//.test(url)) {
      url = 'http://' + url;
    }

    // 3. remove multiple empty spaces and insert %20
    if (this.opts.encodeURI) {
      url = encodeURI(url);
    } else {
      url = url.replace(/\s+/g, ' ');
      url = url.replace(/ /g, '%20');
    }

    return url;
  }


  /**
   * Choose http or https NodeJS libraries.
   */
  _selectRequest() {
    let requestLib;
    if (/^https/.test(this.protocol)) {
      requestLib = https.request.bind(https);
    } else {
      requestLib = http.request.bind(http);
    }
    return requestLib;
  }


  /**
   * Create new http/https agent https://nodejs.org/api/http.html#http_new_agent_options
   * @param {Object} opts
   */
  _hireAgent(opts) {
    // default agent options https://nodejs.org/api/http.html#http_new_agent_options
    const options = {
      timeout: opts.timeout, // close socket on certain period of time
      keepAlive: false, // keep socket open so it can be used for future requests without having to reestablish new TCP connection (false)
      keepAliveMsecs: 1000, // initial delay to receive packets when keepAlive:true (1000)
      maxSockets: Infinity, // max allowed sockets (Infinity)
      maxFreeSockets: 256, // max allowed sockets to leave open in a free state when keepAlive:true (256)
    };

    let agent;
    if (/^https/.test(this.protocol)) {
      agent = new https.Agent(options);
    } else {
      agent = new http.Agent(options);
    }

    return agent;
  }

  /**
   * Kill the agent when it finish its job.
   */
  _killAgent(agent) {
    agent.destroy();
  }


  /**
   * Beautify error messages.
   * @param {Error} error - original error
   * @return formatted error
   */
  _formatError(error, url) {
    // console.log(error);
    const err = new Error(error);


    // reformatting NodeJS errors
    if (error.code === 'ENOTFOUND') {
      err.status = 400;
      err.message = `400 Bad Request [ENOTFOUND] ${url}`;
    } else if (error.code === 'ECONNREFUSED') {
      err.status = 400;
      err.message = `400 Bad Request [ECONNREFUSED] ${url}`;
    } else if (error.code === 'ECONNRESET') {
      err.status = 500;
      err.message = `500 No Server Response [ECONNRESET] ${url}`; // replacing: Error: socket hang up
    } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      err.status = 400;
      err.message = `400 Bad Request [ERR_TLS_CERT_ALTNAME_INVALID] ${error.reason}`;
    } else if (error.status === 404) {
      err.status = 404;
      err.message = `404 Not Found ${url}`;
    } else {
      err.status = error.status || 400;
      err.message = error.message;
    }

    err.original = error;

    return err; // formatted error is returned
  }


  /**
   * Get current date/time
   */
  _getTime() {
    const d = new Date();
    return d.toISOString();
  }


  /**
   * Get time difference in seconds
   */
  _getTimeDiff(start, end) {
    const ds = new Date(start);
    const de = new Date(end);
    return (de.getTime() - ds.getTime()) / 1000;
  }




  /********** REQUESTS *********/

  /**
   * Sending one HTTP request to HTTP server.
   *  - 301 redirections are not handled.
   *  - retries are not handled
   * @param {String} url - https://www.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object} body_obj - http body payload
   */
  askOnce(url, method = 'GET', body_obj) {
    // answer (response object)
    const answer = {
      requestURL: url,
      requestMethod: method,
      status: 0,
      statusMessage: '',
      httpVersion: undefined,
      gzip: false,
      https: false,
      // remoteAddress: // TODO
      // referrerPolicy: // TODO
      req: {
        headers: this.headers,
        payload: undefined
      },
      res: {
        headers: undefined,
        content: undefined
      },
      time: {
        req: this._getTime(),
        res: undefined,
        duration: undefined
      }
    };


    // check and correct URL
    try {
      url = this._parseUrl(url);
      answer.requestURL = url;
      answer.https = /^https/.test(this.protocol);
    } catch (err) {
      // if URL is not properly defined
      const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
      ans.status = 400; // client error - Bad Request
      ans.statusMessage = err.message || 'Bad Request';
      ans.time.res = this._getTime();
      ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

      return ans; // send answer and stop further execution
    }


    const agent = this._hireAgent(this.opts);
    const requestLib = this._selectRequest();



    /*** 1) init HTTP request ***/
    // http.request() options https://nodejs.org/api/http.html#http_http_request_url_options_callback
    const requestOpts = {
      agent,
      hostname: this.hostname,
      port: this.port,
      path: this.pathname + this.queryString,
      method,
      headers: this.headers
    };
    const clientRequest = requestLib(requestOpts);


    /*** 2) add body to HTTP request ***/
    if (!!body_obj && !/GET/i.test(method)) {
      answer.req.payload = body_obj;
      const body_str = JSON.stringify(body_obj);
      this.headers['content-length'] = body_str.length;
      clientRequest.write(body_str);
    }


    const promise = new Promise ((resolve, reject) => {

      /*** 3.A) successful response ***/
      clientRequest.on('response', res => {

        // collect raw data e.g. buffer data
        const buf_chunks = [];
        res.on('data', (buf_chunk) => {
          buf_chunks.push(buf_chunk);
        });


        res.on('end', () => {
          // concat buffer parts
          const buf = Buffer.concat(buf_chunks);

          // decompress
          let gzip = false;
          let gunziped = buf;
          if (!!res.headers['content-encoding'] && res.headers['content-encoding'] === 'gzip') {
            try {
              gunziped = zlib.gunzipSync(buf);
            } catch (err) {

            }
            gzip = true;
          }

          // convert binary (buffer) to string
          let content = gunziped.toString();

          // convert string to object if content is in JSON format
          let contentObj;
          try {
            contentObj = JSON.parse(content);
            if (!!contentObj) {
              content = contentObj;
            }
          } catch(err) {}



          // format answer
          const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
          ans.status = res.statusCode; // 2xx -ok response, 4xx -client error (bad request), 5xx -server error
          ans.statusMessage = res.statusMessage;
          ans.httpVersion = res.httpVersion;
          ans.gzip = gzip;
          ans.res.headers = res.headers;
          ans.res.content = content;
          ans.time.res = this._getTime();
          ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);


          resolve(ans);

          this._killAgent(agent);

        });

      });


      /*** 3.B) on timeout (no response from the server) ***/
      clientRequest.setTimeout(this.opts.timeout);
      clientRequest.on('timeout', () => {
        this._killAgent(agent);

        // format answer
        const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
        ans.status = 408; // 408 - timeout
        ans.statusMessage = `Request aborted due to timeout (${this.opts.timeout} ms) ${url} `;
        ans.time.res = this._getTime();
        ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

        resolve(ans);
      });


      /*** 3.C) on error (only if promise is not resolve by timeout - prevent resolving twice)***/
      clientRequest.on('error', error => {
        this._killAgent(agent);
        const err = this._formatError(error, url);

        // format answer
        const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
        ans.status = err.status;
        ans.statusMessage = err.message;
        ans.time.res = this._getTime();
        ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

        // do not resolve if it's already resolved by timeout
        resolve(ans);
      });



    });

    /*** 4) finish with sending request */
    clientRequest.end();



    return promise;


  } // \askOnce



  /**
   * Sending HTTP request to HTTP server.
   *  - 301 redirections are handled.
   *  - retries are handled
   * @param {String} url - https://www.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object} body_obj - http body
   */
  async ask(url, method = 'GET', body_obj) {

    let answer = await this.askOnce(url, method, body_obj);
    const answers = [answer];


    /*** a) HANDLE 3XX REDIRECTS */
    let redirectCounter = 1;

    while (!!answer && /^3\d{2}/.test(answer.status) && redirectCounter <= this.opts.maxRedirects) { // 300, 301, 302, ...

      const url_new = url_node.resolve(url, answer.res.headers.location); // redirected URL is in 'location' header
      console.log(`#${redirectCounter} redirection ${answer.status} from ${this.url} to ${url_new}`);

      answer = await this.askOnce(url_new, method, body_obj); // repeat request with new url
      answers.push(answer);

      redirectCounter++;
    }



    /*** b) HANDLE RETRIES when status = 408 timeout */
    let retryCounter = 1;

    while (answer.status === 408 && retryCounter <= this.opts.retry) {
      console.log(`#${retryCounter} retry due to timeout (${this.opts.timeout}) on ${url}`);
      await new Promise(resolve => setTimeout(resolve, this.opts.retryDelay)); // delay before retrial

      answer = await this.askOnce(url, method, body_obj);
      answers.push(answer);


      retryCounter++;
    }



    return answers;

  }



  /**
   *
   * @param {String} url - https://api.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object|String} body - http body as Object or String type
   */
  async askJSON(url, method = 'GET', body) {

    // convert body string to object
    let body_obj = body;
    if (typeof body === 'string') {
      try {
        body_obj = JSON.parse(body);
      } catch (err) {
        throw new Error('Body string is not valid JSON.');
      }
    }

    // JSON request headers
    this.setHeaders({
      'content-type': 'application/json; charset=utf-8',
      'accept': 'application/json'
    });

    const answer = await this.askOnce(url, method, body_obj);

    // convert content string to object
    if (!!answer.content) {
      try {
        answer.content = JSON.parse(answer.content);
      } catch (err) {
        throw new Error('Response content is not valid JSON.');
      }
    }

    return answer;

  }




  /********** HEADERS *********/

  /**
   * Change header object.
   * Previously defined this.headers properties will be overwritten.
   * @param {Object} headerObj - {'authorization', 'user-agent', accept, 'cache-control', 'host', 'accept-encoding', 'connection'}
   */
  setHeaders(headerObj) {
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Set (add/update) header.
   * Previously defined header will be overwritten.
   * @param {String} headerName - 'content-type'
   * @param {String} headerValue - 'text/html; charset=UTF-8'
   */
  setHeader(headerName, headerValue) {
    const headerObj = {[headerName]: headerValue};
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Change header object.
   * @param {Array} headerNames - array of header names    ['content-type', 'accept']
   */
  delHeaders(headerNames) {
    headerNames.forEach(headerName => {
      delete this.headers[headerName];
    });
  }


  /**
   * Get active headers
   */
  getHeaders() {
    return this.headers;
  }











}



module.exports = HttpClient;
