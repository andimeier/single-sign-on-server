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

// ----------------------------------------------------
var app = express();

app.use(session({
  name: 'ssoSessionId',
  resave: false,
  saveUninitialized: false
  secret: 'sso-secret-ssshhhhh',
}));

app.get('/user', function (req, res) {
  res.send(req.session.user);
});

app.get('/login', function (req, res) {
  var data;

  data = {
    target: req.query.target
  };
  template.render(res, 'login.html', data);
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/login', function (req, res) {
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
});

app.listen(config.port, function () {
  console.log('Single-Sign-On app listening on port ' + config.port + ' ...');
});
