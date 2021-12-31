module.exports = {
  name: 'development',
  proxyServer: {
    port: 4401,
    request_host: '127.0.0.1',
    request_port: '4400'
  },
  httpServer: {
    port: 4400
  },
  api: {
    baseURL: 'https://jsonplaceholder.typicode.com'
  }
};
