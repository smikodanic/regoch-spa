const Router = require('../../../sys/Router');
const router = new Router({debug: false});

// controllers
const IndexCtrl = require('../controllers/IndexCtrl');
const Page1Ctrl = require('../controllers/Page1Ctrl');
const Page2Ctrl = require('../controllers/Page2Ctrl');
const NotfoundCtrl = require('../controllers/NotfoundCtrl');


// routes
router.when('/', IndexCtrl);
router.when('/page1', Page1Ctrl);
router.when('/page/:pageNum', Page2Ctrl);
router.notFound(NotfoundCtrl);


module.exports = router;
