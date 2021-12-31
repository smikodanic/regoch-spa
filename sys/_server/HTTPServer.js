const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');


/**
 * Internal HTTP Server which will run in case that external is not injected.
 */
class HTTPServer {

  /**
   ** httpOpts:
   * - port:number - HTTP Server port number
   * - timeout:number - ms of inactivity after ws will be closed. If 0 then the ws will never close. Default is 5 minutes.
   * - retries:number - how many times the server will retry to send the response
   * - indexFile:string - index html file, default "index.html"
   * - distDir:string - directory with the dist static files: html, css, js
   * - assetsDir:string - directory with the assets static files: img, font, ...
   * - acceptEncoding:string - gzip or deflate
   * - headers:object - custom headers
   * - debug:boolean - print debug messages
   * @param  {object} httpOpts - options {port, timeout, distDir, indexFile, assetsDir, acceptEncoding, headers, debug}
   * @returns {void}
   */
  constructor(httpOpts) {
    // HTTP server options
    if (!!httpOpts) {
      this.httpOpts = httpOpts;
      if (!this.httpOpts.port) { throw new Error('The server port is not defined.'); }
      else if (this.httpOpts.timeout === undefined) { this.httpOpts.timeout = 5 * 60 * 1000; }
      else if (this.httpOpts.retries === undefined) { this.httpOpts.retries = 10; }
      else if (!this.httpOpts.indexFile) { throw new Error('Parameter "indexFile" is not defined.'); }
      else if (!this.httpOpts.distDir) { throw new Error('Parameter "distDir" is not defined.'); }
      else if (!this.httpOpts.assetsDir) { throw new Error('Parameter "assetsDir" is not defined.'); }
      else if (!this.httpOpts.headers) { this.httpOpts.headers = []; }
    } else {
      throw new Error('HTTP Server options are not defined.');
    }
    this.httpServer;
  }



  /*** HTTP SERVER COMMANDS ***/
  /**
   * Start the HTTP Server
   * @returns {Server} - nodeJS HTTP server instance https://nodejs.org/api/http.html#http_class_http_server
   */
  start() {
    this.retryCount = 0;

    // start HTTP Server
    this.httpServer = http.createServer((req, res) => {

      const reqURL = req.url;
      const urlNoQuery = reqURL.trim().replace(/\?.+/, ''); // URL where query is removed, for example for example ?v=4.7.0

      // define Content-Type header and encoding according to file extension
      const mime = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        ico: 'image/x-icon',
        svg: 'image/svg+xml',
        js: 'application/javascript',
        mp4: 'video/mp4',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        js_map: 'application/json',
        css_map: 'application/octet-stream',
      };
      let contentType = mime.html;
      let encoding = 'utf8';
      const matched = urlNoQuery.match(/\.([^.]+)$/i);
      const matched2 = urlNoQuery.match(/\.([^.]+)\.[^.]+$/i);
      // const matched = urlNoQuery.match(/\.(.+)$/i);
      const fileExt = !!matched ? matched[1] : ''; // html, txt, css, js, png, ...
      const fileExt2 = !!matched2 ? matched2[1] : ''; // on js.map or css.map
      if (/^html$/.test(fileExt)) { contentType = mime.html; encoding = 'utf8'; }
      else if (/^htm$/.test(fileExt)) { contentType = mime.html; encoding = 'utf8'; }
      else if (/^txt$/.test(fileExt)) { contentType = mime.txt; encoding = 'utf8'; }
      else if (/^css$/.test(fileExt)) { contentType = mime.css; encoding = 'utf8'; }
      else if (/^gif$/.test(fileExt)) { contentType = mime.gif; encoding = 'binary'; }
      else if (/^jpg$/.test(fileExt)) { contentType = mime.jpg; encoding = 'binary'; }
      else if (/^jpeg$/.test(fileExt)) { contentType = mime.jpg; encoding = 'binary'; }
      else if (/^svg$/.test(fileExt)) { contentType = mime.svg; encoding = 'binary'; }
      else if (/^png$/.test(fileExt)) { contentType = mime.png; encoding = 'binary'; }
      else if (/^ico$/.test(fileExt)) { contentType = mime.ico; encoding = 'binary'; }
      else if (/^js$/.test(fileExt)) { contentType = mime.js; encoding = 'utf8'; }
      else if (/^mp4$/.test(fileExt)) { contentType = mime.mp4; encoding = 'binary'; }
      else if (/^woff$/.test(fileExt)) { contentType = mime.woff; encoding = 'binary'; }
      else if (/^woff2$/.test(fileExt)) { contentType = mime.woff2; encoding = 'binary'; }
      else if (/^ttf$/.test(fileExt)) { contentType = mime.ttf; encoding = 'binary'; }
      else if (/^map$/.test(fileExt) && /^css$/.test(fileExt2)) { contentType = mime.js_map; encoding = 'utf8'; }
      else if (/^map$/.test(fileExt) && /^js$/.test(fileExt2)) { contentType = mime.css_map; encoding = 'utf8'; }


      // define file path
      let filePath;
      if (!fileExt) { // if request doesn't contain file extension, for example / or /some/thing/ request index.html
        const reqFile = this.httpOpts.indexFile || 'index.html';
        filePath = path.join(process.cwd(), reqFile);
      } else if (/^\/assets\//.test(urlNoQuery)) { // if request contains /assets/
        const reqFile = urlNoQuery;
        filePath = path.join(process.cwd(), this.httpOpts.assetsDir, '../', reqFile);
      } else { // if there's file extension for example /script.js or /some/style.css
        const reqFile = urlNoQuery;
        filePath = path.join(process.cwd(), this.httpOpts.distDir, reqFile);
      }

      // send response to the client
      this.sendResponse(res, req, contentType, filePath);

      // debugging
      if (this.httpOpts.debug) {
        console.log('\n\nrequested URL:: ', reqURL);
        console.log('urlNoQuery:: ', urlNoQuery);
        console.log('fileExt::', fileExt, 'fileExt2::', fileExt2, ' contentType::', contentType, ' encoding::', encoding);
        console.log('filePath:: ', filePath);
        console.log('acceptEncoding:: ', this.httpOpts.acceptEncoding);
      }

    });


    // configure HTTP Server
    this.httpServer.listen(this.httpOpts.port);
    this.httpServer.timeout = this.httpOpts.timeout;


    // listen for server events
    this._onListening();
    this._onClose();
    this._onKILL();
    this._onError();
  }





  /**
   * Stop the HTTP Server
   */
  stop() {
    this.httpServer.close();
  }




  /**
   * Restart the HTTP Server
   */
  async restart() {
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 2100));
    this.start();
  }



  async sendResponse(res, req, contentType, filePath) {
    if (this.retryCount >= this.httpOpts.retries) {
      console.log('\x1b[31m' + 'Max retries reached' + '\x1b[0m');
      res.writeHead(404, { 'X-Error': 'Max retries reached' });
      res.end();
      this.retryCount = 0;
      return;
    }

    if (fs.existsSync(filePath)) {
      this.retryCount = 0;

      try {
        /*** A) set headers defined in the httpOpts ***/
        const headerProps = Object.keys(this.httpOpts.headers);
        for (const headerProp of headerProps) {
          res.setHeader(headerProp, this.httpOpts.headers[headerProp]);
        }
        res.setHeader('Content-Type', contentType);



        /*** B) compress response ***/
        let acceptEncodingBrowser = req.headers['accept-encoding']; // defines what browser can accept
        if (!acceptEncodingBrowser) { acceptEncodingBrowser = ''; }

        const raw = fs.createReadStream(filePath);

        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
        if (acceptEncodingBrowser.match(/\bgzip\b/) && this.httpOpts.acceptEncoding === 'gzip') {
          res.writeHead(200, { 'Content-Encoding': 'gzip' });
          raw.pipe(zlib.createGzip()).pipe(res);
        } else if (acceptEncodingBrowser.match(/\bdeflate\b/) && this.httpOpts.acceptEncoding === 'deflate') {
          res.writeHead(200, { 'Content-Encoding': 'deflate' });
          raw.pipe(zlib.createDeflate()).pipe(res);
        } else {
          res.writeHead(200);
          raw.pipe(res);
        }

      } catch (err) {
        console.log(err);
      }

    } else { // file doesn't exist
      this.retryCount++;

      const errMsg = `NOT FOUND: "${filePath}"  (${this.retryCount} of ${this.httpOpts.retries} retries) `;
      console.log('\x1b[31m' + errMsg + '\x1b[0m');

      // retry every 1 second
      await new Promise(r => setTimeout(r, 1000));
      await this.sendResponse(res, req, contentType, filePath);
    }

  }




  /*** HTTP SERVER EVENTS ***/
  _onListening() {
    this.httpServer.on('listening', () => {
      const addr = this.httpServer.address();
      const ip = addr.address === '::' ? '127.0.0.1' : addr.address;
      const port = addr.port;
      console.log(`👌  HTTP Server is started on http://${ip}:${port}`);
    });
  }


  _onClose() {
    this.httpServer.on('close', () => {
      console.log(`✋  HTTP Server is stopped.`);
    });
  }


  // on CTRL-C or gulp serverNode::stop()
  _onKILL() {
    process.on('SIGINT', () => {
      console.log('💥  HTTP Server is killed');
      this.stop();
    });
  }


  _onError() {
    this.httpServer.on('error', error => {
      switch (error.code) {
        case 'EACCES':
          console.error(this.httpOpts.port + ' permission denied');
          console.error(error);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(this.httpOpts.port + ' already used');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }



}



module.exports = HTTPServer;
