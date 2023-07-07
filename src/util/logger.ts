import { createLogger, format, transports } from 'winston';

const prettyJson = format.printf((info) => {
  if (typeof info.message === 'object') {
    info.message = JSON.stringify(info.message);
  }
  return `${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        prettyJson,
        format.colorize(),
        format.simple(),
        format.splat(),
        format.timestamp(),
        format.errors({ stack: true })
      ),
    }),
  ],
});

export const log = logger;
