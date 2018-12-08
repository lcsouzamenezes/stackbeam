## ZeroCrash

```js
const TOKEN = '0ABCDEF12345678901234567890123456789012345678901234567890ABCDEF0';
const ZeroCrash = require('zerocrash').install(TOKEN);

app.use(ZeroCrash.requestHandler());

app.get('/', (req, res) => res.json({ message: 'hello world' });

app.use(ZeroCrash.errorHandler());
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install zerocrash --save
```

### Security Issues

If you discover a security vulnerability in ZeroCrash, please see [Security Policies and Procedures](Security.md).

## People

The original authors of ZeroCrash are [Pierre El Raii](https://github.com/pierreraii) and [Surge](https://github.com/surgeharb)

[List of all contributors](https://github.com/nodeward/zerocrash/graphs/contributors)

## License

  [MIT](LICENSE)