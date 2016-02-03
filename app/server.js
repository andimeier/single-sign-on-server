var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var config = require('./config');
var login = require('./util/login');

// base directory for view templates
global.viewBaseDir = __dirname + '/views';


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


app.get('/user/:ssoToken', login.getAndSendSession);
app.get('/user', login.sendSession);
app.get('/login', login.enterLogin);

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/login', login.processLogin);


app.listen(config.port, function () {
  console.log('Single-Sign-On app listening on port ' + config.port + ' ...');
});
