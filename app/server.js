var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var uri = require('urijs');
var template = require('./util/template');
var auth = require('./util/auth');
var config = require('./config');

// base directory for view templates
global.viewBaseDir = __dirname + '/views';

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


function getAndSendSession(req, res) {
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


function sendSession(req, res) {
  // no ssoToken as query parameter => fetch it from session (this only works
  // if a user agent (a.k.a. browser) requests the info.
  res.send(req.session.user);
}


function login(req, res) {
  var data;

  data = {
    target: req.query.target
  };
  template.render(res, 'login.html', data);
};


function processLogin(req, res) {
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


// ----------------------------------------------------
var app = express();
var sessionStore; // ?TODO where do I get the session store instance from?


app.use(session({
  name: 'ssoSessionId',
  resave: false,
  saveUninitialized: false,
  secret: 'sso-secret-ssshhhhh',
  store: sessionStore
}));


app.get('/user/:ssoToken', getAndSendSession);
app.get('/user', sendSession);
app.get('/login', login);

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/login', processLogin);


app.listen(config.port, function () {
  console.log('Single-Sign-On app listening on port ' + config.port + ' ...');
});
