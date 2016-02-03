# single-sign-on-server

Single-Sign-On (SSO) server ("Identity Provider" in SAML terms).

## Install and run server

    npm install
    npm start

## Usage on the client

To use the SSO facility, the "Session Provider" (in SAML terms) must:

call

    http(s)://${SSO_HOST}/login?target=${TARGET_URL}

with:

* ${SSO_HOST} = host/port of this server (Identity Provider)
* ${TARGET_URL} = the URL which the Identity Provider should redirect to after
  successful authentication
