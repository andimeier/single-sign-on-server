var uri = require('urijs');
var template = require('./template');
var auth = require('./auth');

/**
 * appends an authentication key to the target URL and then redirects there
 *
 * @param {object} res express response object
 * @param {string} target the target URL
 * @param {string} sessionId
 */
function redirectToTarget(res, target, sessionId) {

  // append target
  res.redirect(uri(target).addQuery("ssoSessionId", sessionId));
}


exports.getAndSendSession = function (req, res) {
  // if a backend requests the session info, it has no access to session
  // cookies, since these are stored in the browser cookie cache. Thus, to
  // retrieve session info, the requesting backend must provide the SSO token
  // in the request URL as a parameter
  store.get(req.params.ssoToken, function (err, data) {
    if (err) {
      res.status(401).send(err);
    }

    res.send(data);
  });
}


exports.sendSession = function (req, res) {
  // no ssoToken as query parameter => fetch it from session (this only works
  // if a user agent (a.k.a. browser) requests the info.
  res.send(req.session.user);
}


exports.enterLogin = function (req, res) {
  var data;

  data = {
    target: req.query.target
  };
  template.render(res, 'login.html', data);
};


exports.processLogin = function (req, res) {
  var username;
  var password;
  var target;

  username = req.body.username;
  password = req.body.password;
  target = req.body.target;

  auth.authenticate(username, password, function (err, data) {
    if (err) {
        template.render(res, 'login.html', {
          username: username,
          errorMessage: err
        });
        return;
    }

    // authentication successful

    // store user data in session
    // TODO: use another session store, not the default Memory store.
    // e.g. session-file-store or connect-redis
    req.session.user = data;

    if (target) {
      redirectToTarget(res, target, req.session.id);
    } else {
      template.render(res, 'loginOk.html', {
        username: username
      });
    }
  });
}
