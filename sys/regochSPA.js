const EventEmitter = require('./EventEmitter');
const router = require('../app/src/config/routes');


// test URI against routes when browser's Reload button is clicked
const uri = window.location.pathname + window.location.search; // /page1.html?q=12
router.testRoutes(uri);


// test URI against routes when element with data-rg-hrf attribute is clicked
const eventEmitter = new EventEmitter();
eventEmitter.on('pushstate', event => {
  const uri = window.location.pathname + window.location.search; // browser address bar URL
  // console.log(uri, event.detail.href);
  router.testRoutes(uri);
});
