# StackBeam
##### For API only usage [skip the Usage and Installation steps](#api-usage)!
---

## FEATURES
- Monitor incoming HTTP requests
- Diagnose errors happening in your application's code
- View queries being executed on your MongoDB database
- Keep an eye on your server's CPU, Memory and Storage usage
- Get notified in case of emergency (High error rates, high latency...)
- Track realtime log entries (Coming soon)

## Website
[https://stackbeam.io/](https://stackbeam.io/).

## DASHBOARD
[https://app.stackbeam.io/](https://app.stackbeam.io/).

## Usage

```js
// Token acquired from the dashboard projects page
const TOKEN = '0ABCDEF12345678901234567890123456789012345678901234567890ABCDEF0';

// Ability to turn on/off specific features (All on by default)
const options = { alarm: true, events: true, benchmarks: true, crashReporting: true };

// Installing and Initializing the module
const StackBeam = require('stackbeam').install(TOKEN, options);

// Before including any route
app.use(StackBeam.requestHandler());
 
// Require mongoDB and pass it as an argument 
app.use(StackBeam.dbHandler(mongodbInstance)); 

// Normal Express routes...
app.get('/', (req, res) => res.json({ message: 'hello world' });

// After including all routes
app.use(StackBeam.errorHandler());
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install stackbeam --save
```

## API Usage
##### (for non-nodejs projects)

```
  ## !!Replace <token> with the token from the dashboard
  
  ## Endpoints Request
  curl -X POST \ 
      -d '{"endpoint": "/users/:id", "method": "GET", "startAt": "1544268184321", "end": "1544268181234", "ip": "181.215.95.235", "resStatusCode": "200", "resStatusMessage": "Success"}' \
      -H 'Token: <token>' \
      -H 'Content-Type: application/json' \
      'https://api.stackbeam.io/library/metrics'

  ## Exceptions Request
  curl -X POST \ 
      -d '{"errMsg":"TypeError", "errName":"cannot read property 'length' of undefined", "filename": "app.js", "colno":"13", "lineno":"80", "pre_context":"let x = [1,2,3]", "context_line":"console.log(y.length)", "post_context":"console.log(`DONE ${x}`)", "function":"getLength"}' \
      -H 'Token: <token>' \
      -H 'Content-Type: application/json' \
      'https://api.stackbeam.io/library/exceptions'
```

### Security Issues

If you discover a security vulnerability in Stackbeam, please see [Security Policies and Procedures](Security.md).

## People

The original authors of StackBeam are [Pierre Raii](https://github.com/pierreraii) and [Surge](https://github.com/surgeharb)

[List of all contributors](https://github.com/nodeward/stackbeam/graphs/contributors)

## License

  [MIT](LICENSE)
