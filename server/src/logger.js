import pino from 'pino';
import logkit from 'logkitx';

// Create the main logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,module',
      messageFormat: '{module} - {msg}',
      singleLine: true
    }
  } : undefined
}, process.stderr);

// Configure pino-debugger
logkit(logger, {
  auto: true,
  map: {
    'app:server': 'info',
    'app:auth': 'debug',
    'app:error': 'error',
    'app:request': 'debug',
    'app:response': 'debug',
    'express:router': 'debug',
    'mongoose:*': 'debug',
    '*': 'trace'
  },
  levels: ['fatal', 'error', 'warn', 'debug', 'info', 'trace'],
  format: 'logfmt'
});

const loggerHelper = {};

// Create child loggers for different modules
loggerHelper.createChildLogger = (module) => {
  return logger.child({ module });
};

// Main logger instance
loggerHelper.logger = logger;

// Pre-configured child loggers for common modules
loggerHelper.serverLogger = logger.child({ module: 'server' });
loggerHelper.authLogger = logger.child({ module: 'auth' });
loggerHelper.errorLogger = logger.child({ module: 'error' });
loggerHelper.requestLogger = logger.child({ module: 'request' });
loggerHelper.dbLogger = logger.child({ module: 'database' });

// Helper methods for structured logging
loggerHelper.logRequest = (req, res, next) => {
  const start = Date.now();
  
  loggerHelper.requestLogger.info({
    method: req.method,
    url: req.url,
    ip: req.client_ip_address || req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id || Math.random().toString(36).substr(2, 9)
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    loggerHelper.requestLogger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.client_ip_address || req.ip
    }, 'Request completed');
  });

  next();
};

loggerHelper.logError = (error, req = null, additionalInfo = {}) => {
  const errorInfo = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...additionalInfo
    }
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      ip: req.client_ip_address || req.ip,
      userAgent: req.get('User-Agent')
    };
  }

  loggerHelper.errorLogger.error(errorInfo, 'Application error occurred');
};

loggerHelper.logAuth = (action, userId, success, additionalInfo = {}) => {
  loggerHelper.authLogger.info({
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  }, `Authentication ${action}`);
};

loggerHelper.logDatabase = (operation, collection, success, duration, additionalInfo = {}) => {
  loggerHelper.dbLogger.debug({
    operation,
    collection,
    success,
    duration: `${duration}ms`,
    ...additionalInfo
  }, `Database ${operation}`);
};

function levelValue(level) {
  switch ((level ?? '').toLowerCase()) {
    case 'trace':
      return 10;
    case 'debug':
      return 20;
    case 'info':
      return 30;
    case 'warn':
      return 40;
    case 'error':
      return 50;
    case 'fatal':
      return 60;
    default:
      return 30;
  }
}

function safeJson(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return '"[unserializable]"';
  }
}

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (key.includes('secret') || key.includes('passphrase') || key.includes('apikey') || key.includes('access-key')) {
      out[k] = '[redacted]';
      continue;
    }
    out[k] = redact(v);
  }
  return out;
}

export class Logger {
  constructor({ level = 'info', json = true, name = 'app', base = {} } = {}) {
    this.level = level;
    this.json = json;
    this.name = name;
    this.base = base;
    this.threshold = levelValue(level);
  }

  child(extraBase = {}) {
    return new Logger({
      level: this.level,
      json: this.json,
      name: this.name,
      base: { ...(this.base ?? {}), ...(extraBase ?? {}) }
    });
  }

  setLevel(level) {
    this.level = level;
    this.threshold = levelValue(level);
  }

  trace(msg, data) {
    this.#log('trace', msg, data);
  }
  debug(msg, data) {
    this.#log('debug', msg, data);
  }
  info(msg, data) {
    this.#log('info', msg, data);
  }
  warn(msg, data) {
    this.#log('warn', msg, data);
  }
  error(msg, data) {
    this.#log('error', msg, data);
  }

  #log(level, msg, data) {
    if (levelValue(level) < this.threshold) return;
    const entry = {
      ts: new Date().toISOString(),
      level,
      name: this.name,
      msg,
      ...redact(this.base ?? {}),
      ...(data ? redact(data) : {})
    };
    if (this.json) {
      const line = safeJson(entry);
      if (levelValue(level) >= 40) console.error(line);
      else console.log(line);
      return;
    }
    const prefix = `[${entry.ts}] ${level.toUpperCase()} ${this.name}`;
    const rest = data ? ` ${safeJson(redact(data))}` : '';
    if (levelValue(level) >= 40) console.error(`${prefix} ${msg}${rest}`);
    else console.log(`${prefix} ${msg}${rest}`);
  }
}

export default loggerHelper;