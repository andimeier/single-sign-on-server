var uri = require('urijs');
var template = require('./template');
var auth = require('./auth');


/**
 * tries to determine the plain target URL of a string. If the string is
 * already plain text starting with 'http', it is returned as is. If it
 * is base64 encoded, the decoded (plain) text will be returned.
 *
 * In any case, after decoding attempts, the target URL is expected to start
 * with 'http'. If it does not, no target URL is recognized and the function
 * returns null instead.
 *
 * @param {string} target the target, either plain text or base64 encoded
 * @return {string} the decoded target URL, starting with 'https?://'
 */
function decodeTarget(target) {
  var decoded;

  function isValidUrl(url) {
    return url.match(/^https?:\/\//);
  }

  // is target unencoded (urlencoding has already been decoded)
  if (isValidUrl(target)) {
    return target;
  }

  // base64 encoding?
  decoded = new Buffer(target, 'base64').toString('ascii');
  console.log('base64 decoded: ' + decoded);
  if (isValidUrl(decoded)) {
    return decoded;
  }

  return null;
}


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


exports.getAndSendSession = function(req, res) {
  // if a backend requests the session info, it has no access to session
  // cookies, since these are stored in the browser cookie cache. Thus, to
  // retrieve session info, the requesting backend must provide the SSO token
  // in the request URL as a parameter

  if (req.params.format) {
    format = req.params.format;
    switch (format) {
      case 'json':
      case 'saml':
        break;
      default:
        console.log('ERROR unknown response format [' + format + '] requested, should be json or saml. Falling back to saml');
        format = 'saml';
    }
  } else {
    // default
    format = 'saml';
  }

  //? TODO mock session store, replace with real one ...
  var store = {
    get: function (dummy, cb) { cb(null, { username: 'Alex the Wild'}); }
  };
  store.get(req.params.ssoToken, function(err, data) {
    if (err) {
      res.status(401).send(err);
    }

    switch (format) {
      case 'json':
        console.log('output format JSON');
        res.send(data);
        break;

      case 'saml':
        console.log('output format SAML');
        throw new Error('SAML format not implemented yet');
        break;
    }
  });
}


exports.sendSession = function(req, res) {
  // no ssoToken as query parameter => fetch it from session (this only works
  // if a user agent (a.k.a. browser) requests the info.
  res.send(req.session.user);
}


/**
 * present a login mask
 */
exports.enterLogin = function(req, res) {
  var data;

  data = {
    target: req.query.target
  };
  template.render(res, 'login.html', data);
};


/**
 * process a login (credentials have been submitted)
 */
exports.processLogin = function(req, res) {
  var username;
  var password;
  var target;

  username = req.body.username;
  password = req.body.password;
  target = req.body.target;

  auth.authenticate(username, password, function(err, data) {
    if (err) {
      template.render(res, 'login.html', {
        username: username,
        target: target,
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
      decodedTarget = decodeTarget(target);

      if (decodedTarget) {
        console.log('Login successful. Redirecting to ' + decodedTarget);
        redirectToTarget(res, decodedTarget, req.session.id);
      } else {
        template.render(res, 'login.html', {
          username: username,
          target: target,
          errorMessage: 'Redirection target not recognized (expected to start with "http..."): ' + target
        });
        return;
      }

    } else {
      // no target given => stay on site, just print success message
      template.render(res, 'loginOk.html', {
        username: username
      });
    }
  });
}
