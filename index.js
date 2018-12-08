// Native Libs
const fs = require('fs');
const url = require('url');
const path = require('path');
const https = require('http');
const querystring = require('querystring');

// External Libs
const request = require('request');
const stacktrace = require('stack-trace');
const onFinished = require('on-finished');

const ZeroCrash = {};
const LINES_OF_CONTEXT = 7;
const zerocrashVersion = require(`${path.resolve(__dirname)}/package.json`).version;

const DEFAULT_OPTIONS = {
  'alarm': false,
  'events': true,
  'benchmarks': true,
  'crashReporting': true
};

const DEFAULT_CONFIGURATION = {
  installed: false,
  options: DEFAULT_OPTIONS,
  token: ''
};

const API_URL = 'http://207.154.240.216:5555';

/** Configuration */
let configuration = { ...DEFAULT_CONFIGURATION };
let consoleAlerts = {};

const getFunction = line => {
  try {
    return (
      line.getFunctionName() ||
      line.getTypeName() + '.' + (line.getMethodName() || '<anonymous>')
    );
  } catch (e) {
    // This seems to happen sometimes when using 'use strict',
    // stemming from `getTypeName`.
    // [TypeError: Cannot read property 'constructor' of undefined]
    return '<anonymous>';
  }
}

let mainModule =
  ((require.main && require.main.filename && path.dirname(require.main.filename)) ||
    global.process.cwd()) + '/';

const getModule = (filename, base) => {
  if (!base) base = mainModule;

  // It's specifically a module
  let file = path.basename(filename, '.js');
  filename = path.dirname(filename);
  let n = filename.lastIndexOf('/node_modules/');
  if (n > -1) {
    // /node_modules/ is 14 chars
    return filename.substr(n + 14).replace(/\//g, '.') + ':' + file;
  }
  // Let's see if it's a part of the main module
  // To be a part of main module, it has to share the same base
  n = (filename + '/').lastIndexOf(base, 0);
  if (n === 0) {
    let module = filename.substr(base.length).replace(/\//g, '.');
    if (module) module += ':';
    module += file;
    return module;
  }
  return file;
}

const readSourceFiles = (filenames, cb) => {
  // we're relying on filenames being de-duped already
  if (filenames.length === 0) return setTimeout(cb, 0, {});

  let sourceFiles = {};
  let numFilesToRead = filenames.length;
  return filenames.forEach(filename => {
    fs.readFile(filename, (readErr, file) => {
      if (!readErr) sourceFiles[filename] = file.toString().split('\n');
      if (--numFilesToRead === 0) cb(sourceFiles);
    });
  });
}

const snipLine = (line, colno) => {
  let ll = line.length;
  if (ll <= 150) return line;
  if (colno > ll) colno = ll;

  let start = Math.max(colno - 60, 0);
  if (start < 5) start = 0;

  let end = Math.min(start + 140, ll);
  if (end > ll - 5) end = ll;
  if (end === ll) start = Math.max(end - 140, 0);

  line = line.slice(start, end);
  if (start > 0) line = '{snip} ' + line;
  if (end < ll) line += ' {snip}';

  return line;
}

const snipLine0 = line => {
  return snipLine(line, 0);
}

const parseStack = (err, cb) => {
  if (!err) return cb([]);

  let stack = stacktrace.parse(err);
  if (!stack || !Array.isArray(stack) || !stack.length || !stack[0].getFileName) {
    return cb([]);
  }

  let frames = [];
  let filesToRead = {};
  stack.forEach(line => {
    let frame = {
      filename: line.getFileName() || '',
      lineno: line.getLineNumber(),
      colno: line.getColumnNumber(),
      function: getFunction(line)
    };

    let isInternal =
      line.isNative() ||
      (frame.filename[0] !== '/' &&
        frame.filename[0] !== '.' &&
        frame.filename.indexOf(':\\') !== 1);

    // in_app is all that's not an internal Node function or a module within node_modules
    // note that isNative appears to return true even for node core libraries
    // see https://github.com/getsentry/raven-node/issues/176
    frame.in_app = !isInternal && frame.filename.indexOf('node_modules/') === -1;

    // Extract a module name based on the filename
    if (frame.filename) {
      frame.module = getModule(frame.filename);
      if (!isInternal) filesToRead[frame.filename] = true;
    }

    frames.push(frame);
  });

  return readSourceFiles(Object.keys(filesToRead), sourceFiles => {
    frames.forEach(frame => {
      if (frame.filename && sourceFiles[frame.filename]) {
        var lines = sourceFiles[frame.filename];
        try {
          frame.pre_context = lines
            .slice(Math.max(0, frame.lineno - (LINES_OF_CONTEXT + 1)), frame.lineno - 1)
            .map(snipLine0);
          frame.context_line = snipLine(lines[frame.lineno - 1], frame.colno);
          frame.post_context = lines
            .slice(frame.lineno, frame.lineno + LINES_OF_CONTEXT)
            .map(snipLine0);
        } catch (e) {
          // anomaly, being defensive in case
          // unlikely to ever happen in practice but can definitely happen in theory
        }
      }
    });

    cb(frames);
  });
};

const sendErrorLogs = (error, type, cb) => {
  console.log('type:', type);

  parseStack(error, stackTrace => {
    let postData = { 'data': stackTrace[0] };
    postData.data.errMsg = error.message;
    postData.data.errName = error.name;
    postData.data.user = {};

    postData.data.sdk = {
      'name': 'zerocrash',
      'version': zerocrashVersion
    };

    postToServer('exceptions', postData, () => {
      cb ? cb(error) : null
    });
  });
};

const install = (token, options = DEFAULT_OPTIONS) => {
  if (!token) {
    console.error('Please provide a valid token');
    return ZeroCrash;
  }

  configuration.options = {
    'alarm': !!options.alarm,
    'events': !!options.events,
    'benchmarks': !!options.benchmarks,
    'crashReporting': !!options.crashReporting
  };

  if (configuration.options.crashReporting) {
    process.on('unhandledRejection', (reason, p) => {
      console.error(reason);
      sendErrorLogs(reason, 'unhandledRejection', () => process.exit(1));
    }).on('uncaughtException', err => {
      console.error(err);
      sendErrorLogs(err, 'uncaughtException', () => process.exit(1));
    });
  }

  configuration.installed = true;
  configuration.token = token;
  return ZeroCrash;
};

const uninstall = () => {
  if (!configuration.installed) {
    console.warn('ZeroCrash is not already installed');
    return ZeroCrash;
  }

  configuration = { ...DEFAULT_CONFIGURATION };
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  return ZeroCrash;
}

const requestHandler = () => (req, res, next) => {
  if (!configuration.installed) {
    console.warn('ZeroCrash will not work unless you install the module');
    return next();
  }

  console.log('req.originalUrl', req.originalUrl);
  if (req.originalUrl === '/z_healthcheck/up') {
    return res.status(200);
  }

  if (!configuration.options.benchmarks) {
    return next();
  }

  req.z_startAt = Date.now();

  onFinished(req, (err, request) => {
    let apiBody = {};
    request.z_endAt = Date.now();
    endpoint = request.originalUrl.split('?')[0];

    if (request.route && request.route.path) {
      endpoint = request.route.path;
    }

    apiBody = {
      endpoint: endpoint,
      method: request.method,
      startAt: request.z_startAt,
      endAt: request.z_endAt,
      ip: request.ip,
      resStatusCode: request.res.statusCode,
      resStatusMessage: request.res.statusMessage,
      headers: JSON.stringify(request.headers)
    };

    postToServer('metrics', apiBody);
  });

  return next();
};

const errorHandler = () => (err, req, res, next) => {
  if (!configuration.installed) {
    console.warn('ZeroCrash will not work unless you install the module');
    return next();
  }

  if (!configuration.options.crashReporting) {
    return next();
  }

  return sendErrorLogs(err, 'handledError', next);
};

const postToServer = (target, data, cb) => {
  if (!configuration.token || !configuration.installed) {
    console.error('ZeroCrash is not installed');
    return;
  }

  if (!['metrics', 'exceptions'].includes(target)) {
    console.error('Wrong API target provided');
    return;
  }

  let targetEndpoint = `${API_URL}/library/${target}`;

  let apiConfig = {
    url: targetEndpoint,
    body: data,
    json: true,
    headers: {
      'content-type': 'application/json',
      'token': configuration.token
    },
  };

  request.post(apiConfig, (error, response, body) => {
    error ? console.log('error: ', error) : null;
    typeof cb === 'function' ? cb() : null;
  });
};

ZeroCrash.requestHandler = requestHandler;
ZeroCrash.errorHandler = errorHandler;
ZeroCrash.uninstall = uninstall;
ZeroCrash.install = install;

module.exports = ZeroCrash;