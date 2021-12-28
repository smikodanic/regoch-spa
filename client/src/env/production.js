module.exports = {
  name: 'production',
  proxy: {
    hostname: '127.0.0.1',
    port: 4500
  },
  server: {
    port: 4501
  },
  api: {
    baseURL: 'https://jsonplaceholder.typicode.com'
  }
};

