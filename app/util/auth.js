
/**
 * @param {string} username
 * @param {string} password
 * @param {function} callback function with signature (err, data). err is the
  *   error string (in case of error), data is the auth object on success
 */
exports.authenticate = function (username, password, callback) {
  if (username === 'alex') {
    callback(null, { userId: 66 });
  } else {
    callback('Wrong username or password.');
  }

}
