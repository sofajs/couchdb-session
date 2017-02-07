# couchdb-session


### configs 
```
const configs = {
    host: http://localhost,
    port: 5984,
    username: 'xxxxx',
    password: 'xxxxx'
} 
```


### session 
object returned by couchdb-session promise.

```
const session = {
    cookie: null,
    cookieVerbose: null,
    expires: String,
    expiresString: String,
    status: 'xxxxx',
    delay: 1000  
} 
```

*delay* 
delay time for renewing almostExpired cookies.
Pre-empt use of expired cookies from making requests.

*cookie*
couchdb session cookie.

*local.ini*
[cookie authentication](http://docs.couchdb.org/en/2.0.0/intro/security.html#cookie-authentication)
[couch_httpd_auth]
secret = ab19f28707dbb74b33089aef8bb08cda
allow_persistent_cookies = true

*expires*
Unix time to expiration. Parsed from header value passed from couchdb.

*status*
200 or error message.
