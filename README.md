# Single-Sign-On-Server

Single-Sign-On (SSO) server ("Identity Provider" in SAML terms).

## Install and run server

Server serving as sort of "identity provider" in the context of a single-sign-on (SSO) system.

## Usage on the client

To use the SSO facility, the "Service Provider" (in SAML terms) must:

### Authenticate

Call

    http(s)://${SSO_HOST}/login?target=${TARGET_URL}

with:

* ${SSO_HOST} = host/port of this server (Identity Provider)
* ${TARGET_URL} = the URL of the Service Provider to which the Identity Provider should redirect after
  successful authentication

### Fetch Auth info

After the Identity Provider has redirected the browser to the specified target URL,
the Service Provider must retrieve the info about the logged in user. To do so,
call

    http(s)://${SSO_HOST}/user?ssoToken=${SSO_TOKEN}

This call will return the user info object, containing the username.
The Service Provider should use this data in its own session store.

### Single-Sign-Off (Keep Alive)

If the session of the Identity Provider has expired or if the user has signed
off centrally, the Service Provider would not know. So, the session on the
Service Provider would live forever.

To keep track of a signed off user, you can use the "Fetch Auth Info" request
as before. If it still returns the same user object, the SSO session is still
valid. If the request returns an invalid object, the SSO session has become
invalid. As a consequence, the Service Provider should now invalidate its own
user session.

It is an implementation detail whether this "Keep Alive" mechanism is triggered
from time to time (asynchronously) or with each request to the Service Provider's
backend. But keep in mind that only by sending this "Fetch Auth Info" requests,
the Identity Provider's session is refreshed, thus prolongig the central session.

Unless the central session is very long-lasting (very long session timeout), it
is important to keep the central session alive from time to time. Otherwise Otherwise
Service Providers would not benefit from the SSO mechanism since they would
get no valid session from the Identity Provider although the user has a vital
"communication" with the first Service Provider.
