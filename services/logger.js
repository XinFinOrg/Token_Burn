"use strict";
const winston = require("winston");
const argv = require("yargs").argv;
const _ = require("lodash");

let currLog = "info";
const levelNames = ["error", "warn", "info", "verbose", "debug", "http"];

if (_.isEmpty(argv) || _.isEmpty(argv["log"])) {
  console.log('[*] no log level specified, using level "info" as default');
} else {
  if (levelNames.includes(argv["log"])) {
    currLog = argv["log"];
    console.log(`[*] Log level changed, current log level "${currLog}"`);
  } else {
    console.log("[*] Invalid log level, defaulting to `info`");
  }
}

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    http: 2,
    info: 3,
    verbose: 4,
    debug: 5
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "grey",
    verbose: "magenta",
    debug: "blue"
  }
};
winston.addColors(logLevels);

const logger = winston.createLogger({
  level: currLog,
  levels: logLevels.levels,
  format:  winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: "./logs/info.log" })
  ]
});

logger.stream = {
  write: function(message) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.http(message);
  }
};

exports.logger = logger;
