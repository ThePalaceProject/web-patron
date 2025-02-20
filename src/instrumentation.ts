import { IS_SERVER } from "utils/env";

import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { WinstonTransport } from "@loglayer/transport-winston";

/**
 * Strip ANSI codes from a string, which is something Next.js likes to inject.
 */
function stripAnsiCodes(str: string): string {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

/**
 * Create a console method that logs to LogLayer
 * https://loglayer.dev/example-integrations/nextjs.html
 */
function createConsoleMethod(
  log: any,
  method: "error" | "info" | "warn" | "debug" | "log"
) {
  let mappedMethod = method;

  if (method === "log") {
    mappedMethod = "info";
  }

  return (...args: unknown[]) => {
    const data: Record<string, unknown> = {};
    let hasData = false;
    let error: Error | null = null;
    const messages: string[] = [];

    for (const arg of args) {
      if (arg instanceof Error) {
        error = arg;
        continue;
      }

      if (typeof arg === "object" && arg !== null) {
        Object.assign(data, arg);
        hasData = true;
        continue;
      }

      if (typeof arg === "string") {
        messages.push(arg);
      }
    }

    let finalMessage = stripAnsiCodes(messages.join(" ")).trim();

    // next.js uses an "x" for the error message when it's an error object
    if (finalMessage === "⨯" && error) {
      finalMessage = error?.message || "";
    }

    if (error && hasData && messages.length > 0) {
      log.withError(error).withMetadata(data)[mappedMethod](finalMessage);
    } else if (error && messages.length > 0) {
      log.withError(error)[mappedMethod](finalMessage);
    } else if (hasData && messages.length > 0) {
      log.withMetadata(data)[mappedMethod](finalMessage);
    } else if (error && hasData && messages.length === 0) {
      log.withError(error).withMetadata(data)[mappedMethod]("");
    } else if (error && messages.length === 0) {
      log.errorOnly(error);
    } else if (hasData && messages.length === 0) {
      log.metadataOnly(data);
    } else {
      log[mappedMethod](finalMessage);
    }
  };
}

/**
 * LOGGING ERRORS:
 * Error logs take the form of combined {name, message, stack} from serializeError and ApplicationError
 * {
 *  "err": {
 *      "info": Partial<OPDS1.ProblemDocument>,
 *      "name": string,
 *      "message": string,
 *      "stack": string,
 *    }
 * }
 */
export async function register() {
  // Only write to log files if in production i.e. on nodejs runtime,
  // otherwise, the dev server tries to load node.js modules and errors out
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const winston = require("winston");
    require("winston-daily-rotate-file");

    /**
     * For format descriptions: https://github.com/winstonjs/logform#readme
     */
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(info => {
        let log = `${info.timestamp} - ${info.level.toUpperCase()}: [${
          info.message.origin
        }] `;
        if (info.message.err) {
          const { stack, ...msg } = info.message.err;
          const json = JSON.stringify({ ...msg }, null, 4);
          return (log += `${json}\n${stack}`);
        } else {
          log += `[${info.origin}] ${info.message}`;
          if (info.metadata && info.metadata.length > 0) {
            log += ` ${JSON.stringify(info.metadata, null, 4)}`;
          }
          return log;
        }
      })
    );

    const consoleTransport = new winston.transports.Console({
      level: process.env.CONSOLE_LOG_LEVEL || "info",
      format: consoleFormat
    });

    /**
     * Daily rolling log file
     */
    const fileTransport = new winston.transports.DailyRotateFile({
      filename: "./logs/web-patron-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: process.env.FILE_LOG_LEVEL || "warn",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });

    const winstonLogger = winston.createLogger({
      defaultMeta: { service: "web-patron" },
      transports: [consoleTransport, fileTransport]
    });

    const logger = new LogLayer({
      errorSerializer: serializeError,
      transport: [
        new WinstonTransport({
          logger: winstonLogger
        })
      ]
    });

    // If error, then { origin } is found as property of message,
    // otherwise it is at root of log object
    logger.withContext({ origin: IS_SERVER ? "Server" : "Client" });

    console.error = createConsoleMethod(logger, "error");
    console.log = createConsoleMethod(logger, "log");
    console.info = createConsoleMethod(logger, "info");
    console.warn = createConsoleMethod(logger, "warn");
    console.debug = createConsoleMethod(logger, "debug");
  }
}
