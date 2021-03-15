// route definitions
module.exports = [
  ['when', '/', 'IndexCtrl'],
  ['when', '/page1', 'Page1Ctrl'],
  ['when', '/page/:pageNum', 'Page2Ctrl'],
  ['when', '/form', 'FormCtrl'],
  ['notFound', 'NotfoundCtrl'],
];
