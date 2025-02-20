const { createLogger, format, transports } = require("winston");

// logger for next.config.js
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.simple(),
    format.printf(info => {
      let log = `${info.timestamp} - ${info.level}: ${info.message}`;
      if (info.metadata.length > 0) {
        log += ` ${JSON.stringify(info.metadata, null, 4)}`;
      }
      return log;
    })
  ),
  transports: [new transports.Console()]
});

module.exports = logger;
