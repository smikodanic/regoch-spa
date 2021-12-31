module.exports = {
  name: 'production',
  proxyServer: {
    port: 4501,
    request_host: '127.0.0.1',
    request_port: '4500'
  },
  httpServer: {
    port: 4500
  },
  api: {
    baseURL: 'https://jsonplaceholder.typicode.com'
  }
};

