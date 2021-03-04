/* eslint-disable @typescript-eslint/no-unused-vars */

import winston from 'winston';
import { logger } from 'express-winston';

export default logger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  expressFormat: true,
  colorize: false,
  statusLevels: true,
});
