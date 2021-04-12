module.exports = {
  apiLogin: 'http://localhost:8001/users/login',
  afterGoodLogin:  '/playground/{loggedUserRole}/dashboard', // redirect after succesful login:
  afterBadLogin: '/playground/login',  // redirect after unsuccesful login
  afterLogout: '/playground/login'     // URL after logout
};
