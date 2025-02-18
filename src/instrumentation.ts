// eslint-disable-next-line prettier/prettier
import { LogLayer, PluginBeforeMessageOutParams, type ILogLayer } from "loglayer";
// import { PinoTransport } from "@loglayer/transport-pino";
import { serializeError } from "serialize-error";
// import pino from "pino";
// import { LogFileRotationTransport } from "@loglayer/transport-log-file-rotation"
import winston, {format} from "winston";
import "winston-daily-rotate-file"

import { IS_SERVER } from 'utils/env'
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

// Create a Pino instance (only needs to be done once)
// const pinoLogger = pino({
//   level: "trace", // Set to desired log level
//   formatters: {
//     level: level => ({ level })
//   }
// });
const fileTransport = new winston.transports.DailyRotateFile({
    filename: './logs/web-patron-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

const consoleTransport = new winston.transports.Console()

const winstonLogger = winston.createLogger({
    level: "info",
    defaultMeta: "web-patron",
    format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    transports: [fileTransport, consoleTransport]
})

/**
 * Create a console method that logs to LogLayer
 */
function createConsoleMethod(log: ILogLayer, method: "error" | "info" | "warn" | "debug" | "log") {
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

  export async function register() {
    const logger = new LogLayer({
  errorSerializer: serializeError,
  transport:[
    // new LogFileRotationTransport({
    //     filename: "./logs/web-patron-%DATE%.log",
    //     frequency: "daily",
    //     dateFormat: "YMD",
    //     enabled: IS_SERVER,
        
    // }),
    new WinstonTransport({
        logger: winstonLogger,
        enabled: IS_SERVER
    })
  ],
  plugins: [
    {
      // Add a plugin to label the log entry as coming from the server or client
      onBeforeMessageOut(params: PluginBeforeMessageOutParams) {
        const tag = IS_SERVER ? "Server" : "Client";

        if (params.messages && params.messages.length > 0) {
          if (typeof params.messages[0] === "string") {
            params.messages[0] = `[${tag}] ${params.messages[0]}`;
          }
        }

        return params.messages;
      },
    },
  ]
});

if (process.env.NEXT_RUNTIME === "nodejs") {
    console.error = createConsoleMethod(logger, "error");
    console.log = createConsoleMethod(logger, "log");
    console.info = createConsoleMethod(logger, "info");
    console.warn = createConsoleMethod(logger, "warn");
    console.debug = createConsoleMethod(logger, "debug");
  }
  }


