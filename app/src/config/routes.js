const router = require('../../../sys').router;



// controllers
const IndexCtrl = require('../controllers/IndexCtrl');
const Page1Ctrl = require('../controllers/Page1Ctrl');
const Page2Ctrl = require('../controllers/Page2Ctrl');
const FormCtrl = require('../controllers/FormCtrl');
const NotfoundCtrl = require('../controllers/NotfoundCtrl');


// routes
router.when('/', IndexCtrl);
router.when('/page1', Page1Ctrl);
router.when('/page/:pageNum', Page2Ctrl);
router.when('/form', FormCtrl);
router.notFound(NotfoundCtrl);


module.exports = router;
