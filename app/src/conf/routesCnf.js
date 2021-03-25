const log1 = () => { console.log(`1 Host is ${window.location.host}.`); };
const log2 = () => { console.log(`2 Current URI is ${window.location.pathname}${window.location.search}.`); };



// route definitions
module.exports = [
  ['when', '/', 'HomeCtrl'],
  ['when', '/single-page-app', 'SinglePageAppCtrl'],
  ['notfound', 'NotfoundCtrl'],
  ['do', log1, log2]
];
