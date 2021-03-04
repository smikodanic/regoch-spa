const IndexCtrl = require('../controllers/IndexCtrl');
const Page1Ctrl = require('../controllers/Page1Ctrl');
const Page2Ctrl = require('../controllers/Page2Ctrl');


/**
   * Define routes
   * @param {RegochSPA} regochSPA - instance of the sys/RegochSPA
   * @returns{void}
   */
module.exports = regochSPA => {
  regochSPA.route('/', IndexCtrl);
  regochSPA.route('/page1', Page1Ctrl);
  regochSPA.route('/page/:pageNum', Page2Ctrl);
};
