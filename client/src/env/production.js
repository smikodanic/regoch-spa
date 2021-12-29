module.exports = {
  name: 'production',
  proxy: {
    port: 4400,
    request_host: '127.0.0.1',
    request_port: '4401'
  },
  server: {
    port: 4501
  },
  api: {
    baseURL: 'https://jsonplaceholder.typicode.com'
  }
};

