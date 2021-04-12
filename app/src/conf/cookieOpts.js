module.exports = {
  // domain: 'localhost',
  path: '/',
  expires: 5, // number of days or exact date
  secure: false,
  httpOnly: false,
  sameSite: 'strict' // 'strict' for GET and POST, 'lax' only for POST
};
