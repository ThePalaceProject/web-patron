const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.align(),
    format.timestamp(),
    format.simple(),
    format.printf(info => {
      return `${info.timestamp} - ${info.level}: ${
        info.message
      } ${JSON.stringify(info.metadata, null, 4)}`;
    })
  ),
  transports: [new transports.Console()]
});

module.exports = logger;
