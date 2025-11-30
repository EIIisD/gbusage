#!/usr/bin/env node

import { initializeExchangeRate } from '@gbusage/internal/exchange-rate';
import { run } from './run.ts';

// Initialize exchange rate in background (uses file cache for immediate availability)
void initializeExchangeRate();

// eslint-disable-next-line antfu/no-top-level-await
await run();
