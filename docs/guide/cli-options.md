# Command-Line Options

gbusage provides extensive command-line options to customize its behavior. These options take precedence over configuration files and environment variables.

## Global Options

All gbusage commands support these global options:

### Date Filtering

Filter usage data by date range:

```bash
# Filter by date range
gbusage daily --since 20250101 --until 20250630

# Show data from a specific date
gbusage monthly --since 20250101

# Show data up to a specific date
gbusage session --until 20250630
```

### Output Format

Control how data is displayed:

```bash
# JSON output for programmatic use
gbusage daily --json
gbusage daily -j

# Show per-model breakdown
gbusage daily --breakdown
gbusage daily -b

# Combine options
gbusage daily --json --breakdown
```

### Cost Calculation Mode

Choose how costs are calculated:

```bash
# Auto mode (default) - use costUSD when available
gbusage daily --mode auto

# Calculate mode - always calculate from tokens
gbusage daily --mode calculate

# Display mode - only show pre-calculated costUSD
gbusage daily --mode display
```

### Sort Order

Control the ordering of results:

```bash
# Newest first (default)
gbusage daily --order desc

# Oldest first
gbusage daily --order asc
```

### Offline Mode

Run without network connectivity:

```bash
# Use cached pricing data
gbusage daily --offline
gbusage daily -O
```

### Timezone

Set the timezone for date calculations:

```bash
# Use UTC timezone
gbusage daily --timezone UTC

# Use specific timezone
gbusage daily --timezone America/New_York
gbusage daily -z Asia/Tokyo

# Short alias
gbusage monthly -z Europe/London
```

#### Timezone Effect

The timezone affects how usage is grouped by date. For example, usage at 11 PM UTC on January 1st would appear on:

- **January 1st** when `--timezone UTC`
- **January 1st** when `--timezone America/New_York` (6 PM EST)
- **January 2nd** when `--timezone Asia/Tokyo` (8 AM JST next day)

### Locale

Control date and time formatting:

```bash
# US English (12-hour time format)
gbusage daily --locale en-US

# Japanese (24-hour time format)
gbusage blocks --locale ja-JP

# German (24-hour time format)
gbusage session -l de-DE

# Short alias
gbusage daily -l fr-FR
```

#### Locale Effects

The locale affects display formatting:

**Date Format:**

- `en-US`: 08/04/2025
- `en-CA`: 2025-08-04 (ISO format, default)
- `ja-JP`: 2025/08/04
- `de-DE`: 04.08.2025

**Time Format:**

- `en-US`: 3:30:00 PM (12-hour)
- Others: 15:30:00 (24-hour)

### Debug Options

Get detailed debugging information:

```bash
# Debug mode - show pricing mismatches and config loading
gbusage daily --debug

# Show sample discrepancies
gbusage daily --debug --debug-samples 10
```

### Configuration File

Use a custom configuration file:

```bash
# Specify custom config file
gbusage daily --config ./my-config.json
gbusage monthly --config /path/to/team-config.json
```

## Command-Specific Options

### Daily Command

Additional options for daily reports:

```bash
# Group by project
gbusage daily --instances
gbusage daily -i

# Filter to specific project
gbusage daily --project myproject
gbusage daily -p myproject

# Combine project filtering
gbusage daily --instances --project myproject
```

### Weekly Command

Options for weekly reports:

```bash
# Set week start day
gbusage weekly --start-of-week monday
gbusage weekly --start-of-week sunday
```

### Session Command

Options for session reports:

```bash
# Filter by session ID
gbusage session --id abc123-session

# Filter by project
gbusage session --project myproject
```

### Blocks Command

Options for 5-hour billing blocks:

```bash
# Show only active block
gbusage blocks --active
gbusage blocks -a

# Show recent blocks (last 3 days)
gbusage blocks --recent
gbusage blocks -r

# Set token limit for warnings
gbusage blocks --token-limit 500000
gbusage blocks --token-limit max

# Live monitoring mode
gbusage blocks --live
gbusage blocks --live --refresh-interval 2

# Customize session length
gbusage blocks --session-length 5
```

> **Note:** The MCP server CLI moved to the dedicated `@gbusage/mcp` package. See the [MCP Server guide](/guide/mcp-server) for usage details.

### Statusline

Options for statusline display:

```bash
# Basic statusline
gbusage statusline

# Force offline mode
gbusage statusline --offline

# Enable caching
gbusage statusline --cache

# Custom refresh interval
gbusage statusline --refresh-interval 5
```

## JSON Output Options

When using `--json` output, additional processing options are available:

```bash
# Apply jq filter to JSON output
gbusage daily --json --jq ".data[]"

# Filter high-cost days
gbusage daily --json --jq ".data[] | select(.cost > 10)"

# Extract specific fields
gbusage session --json --jq ".data[] | {date, cost}"
```

## Option Precedence

Options are applied in this order (highest to lowest priority):

1. **Command-line arguments** - Direct CLI options
2. **Custom config file** - Via `--config` flag
3. **Local project config** - `.gbusage/gbusage.json`
4. **User config** - `~/.config/claude/gbusage.json`
5. **Legacy config** - `~/.claude/gbusage.json`
6. **Built-in defaults**

## Examples

### Development Workflow

```bash
# Daily development check
gbusage daily --instances --breakdown

# Check specific project costs
gbusage daily --project myapp --since 20250101

# Export for reporting
gbusage monthly --json > monthly-report.json
```

### Team Collaboration

```bash
# Use team configuration
gbusage daily --config ./team-config.json

# Consistent timezone for remote team
gbusage daily --timezone UTC --locale en-CA

# Generate shareable report
gbusage weekly --json --jq ".summary"
```

### Cost Monitoring

```bash
# Monitor active usage
gbusage blocks --active --live

# Check if approaching limits
gbusage blocks --token-limit 500000

# Historical analysis
gbusage monthly --mode calculate --breakdown
```

### Debugging Issues

```bash
# Debug configuration loading
gbusage daily --debug --config ./test-config.json

# Check pricing discrepancies
gbusage daily --debug --debug-samples 20

# Silent mode for scripts
LOG_LEVEL=0 gbusage daily --json
```

## Short Aliases

Many options have short aliases for convenience:

| Long Option   | Short | Description         |
| ------------- | ----- | ------------------- |
| `--json`      | `-j`  | JSON output         |
| `--breakdown` | `-b`  | Per-model breakdown |
| `--offline`   | `-O`  | Offline mode        |
| `--timezone`  | `-z`  | Set timezone        |
| `--locale`    | `-l`  | Set locale          |
| `--instances` | `-i`  | Group by project    |
| `--project`   | `-p`  | Filter project      |
| `--active`    | `-a`  | Active block only   |
| `--recent`    | `-r`  | Recent blocks       |

## Related Documentation

- [Environment Variables](/guide/environment-variables) - Configure via environment
- [Configuration Files](/guide/config-files) - Persistent configuration
- [Cost Calculation Modes](/guide/cost-modes) - Understanding cost modes
