const http = require('http');
const os = require('os');
const puppeteer = require('puppeteer');



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
  }



  /*** PROXY SERVER COMMANDS ***/
  /**
   * Start the HTTP Server
   * @returns {Server} - nodeJS HTTP server instance https://nodejs.org/api/http.html#http_class_http_server
   */
  start() {
    // start Proxy Server and listen requests
    this.proxyServer = http.createServer(async (req, res) => {
      console.log('\n req.url::', req.url);
      console.log('req.headers-useragent::', req.headers['user-agent']);

      const reqURL = req.url;
      const urlNoQuery = reqURL.trim().replace(/\?.+/, ''); // URL where query is removed, for example for example ?v=4.7.0
      const matched = urlNoQuery.match(/\.([^.]+)$/i);
      const fileExt = !!matched ? matched[1] : ''; // html, txt, css, js, png, ...

      const userAgent = req.headers['user-agent'];
      const userAgentContains = ['bot', 'crawl', 'spider', 'moz'];
      const joined = userAgentContains.join('|'); // bot|crawl
      const reg = new RegExp(joined, 'i');

      if (reg.test(userAgent) && !fileExt) {
        console.log('BOT::', userAgent);

        this.page = await this.browser.newPage();
        const url = `http://${this.opts.request_host}:${this.opts.request_port}${req.url}?fromproxy=yes`;
        await this.page.goto(url);
        const html = await this.page.content();

        res.write(html, 'utf8');
        res.end();

        // close the browser tab
        await new Promise(r => setTimeout(r, 700));
        await this.page.close();

      } else {
        console.log('NOT BOT');
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
    this._onListening();
    this._onClose();
    this._onError();
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



  async openBrowser() {
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

    // prevent closing of the browser
    this.browser.on('disconnected', async () => { await this.openBrowser(); });
  }



  /*** HTTP SERVER EVENTS ***/
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
      this.browser.close();
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
