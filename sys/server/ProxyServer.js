const http = require('http');
const RegochRouter = require('../router/RegochRouter');

const puppeteer = require('puppeteer');
const os = require('os');


// define chrome executable path
const osPlatform = os.platform(); // possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'


let executablePath;
if (/^win/i.test(osPlatform)) {
  executablePath = '';
} else if (/^linux/i.test(osPlatform)) {
  executablePath = '/usr/bin/google-chrome';
}




/**
 * The Proxy Server which converts Single Page Application to Server Side Rendered (SSR) Application.
 */
class ProxyServer {

  /**
   ** opts:
   * - port:number - Proxy Server port number
   * - timeout:number - ms of inactivity after ws will be closed. If 0 then the ws will never close. Default is 5 minutes.
   * - headers:object - custom headers
   * - debug:boolean - print debug messages
   * @param  {object} opts - options {port, timeout, distDir, indexFile, assetsDir, acceptEncoding, headers, debug}
   * @returns {void}
   */
  constructor(opts) {
    // Proxy server options
    if (!!opts) {
      this.opts = opts;
      if (!this.opts.port) { throw new Error('The server "port" is not defined.'); }
      else if (this.opts.timeout === undefined) { this.opts.timeout = 5 * 60 * 1000; }
      else if (!this.opts.headers) { this.opts.headers = []; }
      else if (!this.opts.request_host) { this.opts.request_port = '127.0.0.1'; }
      else if (!this.opts.request_port) { this.opts.request_port = 80; }
    } else {
      throw new Error('Proxy Server options are not defined.');
    }
    this.proxyServer;

    this.regochRouter = new RegochRouter();
    this.routeDefs = []; // [{route, routeParsed, routeOpts}]
  }



  /*** PROXY SERVER COMMANDS ***/
  /**
   * Start the HTTP Server
   * @returns {Server} - nodeJS HTTP server instance https://nodejs.org/api/http.html#http_class_http_server
   */
  start() {
    // open browser
    this.browser_page();


    // start Proxy Server and listen requests
    this.proxyServer = http.createServer(async (req, res) => {
      console.log(`\n ${req.url}`);

      // get uri parsed
      const uriParsed = this.regochRouter._uriParser(req.url);

      // found route definition
      const routeDef_found = this.routeDefs.find(routeDef => { // {route, routeParsed, funcs}
        const routeParsed = routeDef.routeParsed; // {full, segments, base}
        return this.regochRouter._routeRegexMatchNoParams(routeParsed, uriParsed) || this.regochRouter._routeWithParamsMatch(routeParsed, uriParsed);
      });

      console.log('routeDef_found::', routeDef_found);

      if (!!routeDef_found && !!routeDef_found.routeOpts && !!routeDef_found.routeOpts.ssr) {
        console.log('SERVER SIDE RENDER', req.url);

        const url = `http://${this.opts.request_host}:${this.opts.request_port}${req.url}`;
        await this.page.goto(url);
        const html = await this.page.content();
        this.page.close();

        res.write(html, 'utf8');
        res.end();

      } else {
        console.log('NOT SSR');
        const requestOpts = {
          host: this.opts.request_host,
          port: this.opts.request_port,
          path: req.url,
          method: req.method,
          headers: req.headers
        };

        http.request(requestOpts, res2 => {
          res.writeHead(res2.statusCode, res2.headers);
          res2.pipe(res, { end: true });
        }).end();
      }

    });


    // configure HTTP Server
    this.proxyServer.listen(this.opts.port);
    this.proxyServer.timeout = this.opts.timeout;


    // listen for server events
    this.events();
  }



  /**
   * Stop the HTTP Server
   */
  stop() {
    this.proxyServer.close();
  }



  /**
   * Restart the HTTP Server
   */
  async restart() {
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 2100));
    this.start();
  }


  /**
   * Set route definitions i.e. routeDefs
   * @param {string[][]} routesCnf
   * @returns {void}
   */
  routes(routesCnf) {
    for (const routeCnf of routesCnf) {
      // const cmd = routeCnf[0]; // 'when', 'notfound', 'do', 'redirect'
      const route = routeCnf[1]; // '/page1'
      // const ctrlName = routeCnf[2]; // 'Page1Ctrl'
      const routeOpts = routeCnf[3]; // {authGuards: ['autoLogin', 'isLogged', 'hasRole'], ssr: true}

      this.routeDefs.push({
        route,
        routeParsed: this.regochRouter._routeParser(route),
        routeOpts
      });
    }
  }


  async browser_page() {
    const pptrOpts = {
      executablePath,
      headless: false,
      devtools: false,  // Open Chrome devtools at the beginning of the test
      dumpio: false,
      slowMo: 130,  // Wait 130 ms each step of execution, for example chars typing

      // list of all args https://peter.sh/experiments/chromium-command-line-switches/
      args: [
        '--disable-dev-shm-usage',
        `--ash-host-window-bounds=1300x900`,
        `--window-size=1300,900`,
        `--window-position=700,20`,

        // required for iframe
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    };
    this.browser = await puppeteer.launch(pptrOpts);
    this.page = await this.browser.newPage();
  }



  /*** HTTP SERVER EVENTS ***/
  events() {
    this._onListening();
    this._onClose();
    this._onError();
  }


  _onListening() {
    this.proxyServer.on('listening', () => {
      const addr = this.proxyServer.address();
      const ip = addr.address === '::' ? '127.0.0.1' : addr.address;
      const port = addr.port;
      console.log(`👌  Proxy Server is started on http://${ip}:${port}`);
    });
  }


  _onClose() {
    this.proxyServer.on('close', () => {
      console.log(`✋  Proxy Server is stopped.`);
    });
  }


  _onError() {

    this.proxyServer.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = (typeof this.opts.port === 'string')
        ? 'Pipe ' + this.opts.port
        : 'Port ' + this.opts.port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          console.error(error);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  }



}



module.exports = ProxyServer;
