import { createLogger, log as internalLog } from '@gbusage/internal/logger';

import { name } from '../package.json';

export const logger = createLogger(name);

export const log = internalLog;
