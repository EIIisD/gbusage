#!/usr/bin/env bun

/**
 * @fileoverview Main entry point for gbusage CLI tool
 *
 * This is the main entry point for the gbusage command-line interface tool.
 * It provides analysis of Claude Code usage data from local JSONL files.
 * Fork of ccusage (https://github.com/ryoppippi/ccusage)
 *
 * @module index
 */

/* eslint-disable antfu/no-top-level-await */

import { initializeExchangeRate } from '@gbusage/internal/exchange-rate';
import { run } from './commands/index.ts';

// Initialize exchange rate in background (uses file cache for immediate availability)
void initializeExchangeRate();

await run();
