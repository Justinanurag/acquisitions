import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } =
  winston.format;

// Dev format (human readable)
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProd = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "acquisition-api" },

  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    isProd ? json() : devFormat
  ),

  transports: [
    new winston.transports.Console({
      format: isProd
        ? json()
        : combine(colorize(), devFormat),
    }),

    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;
