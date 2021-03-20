module.exports = {
  encodeURI: true,
  timeout: 10000,
  retry: 5,
  retryDelay: 1300,
  maxRedirects: 0,
  headers: {
    'authorization': '',
    'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
    'content-type': 'text/html; charset=UTF-8'
  }
};
