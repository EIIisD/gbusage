# Configuration Files

gbusage supports JSON configuration files for persistent settings. Configuration files allow you to set default options for all commands or customize behavior for specific commands without repeating options every time.

## Quick Start

### 1. Use Schema for IDE Support

Always include the schema for autocomplete and validation:

```json
{
	"$schema": "https://gbusage.com/config-schema.json"
}
```

### 2. Set Common Defaults

Put frequently used options in `defaults`:

```json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"timezone": "UTC",
		"locale": "en-CA",
		"breakdown": true
	}
}
```

### 3. Override for Specific Commands

```json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"breakdown": false
	},
	"commands": {
		"daily": {
			"breakdown": true // Only daily needs breakdown
		}
	}
}
```

### 4. Convert CLI Arguments to Config

If you find yourself repeating CLI arguments:

```bash
# Before (repeated CLI arguments)
gbusage daily --breakdown --instances --timezone UTC
gbusage monthly --breakdown --timezone UTC
```

Convert them to a config file:

```json
// gbusage.json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"breakdown": true,
		"timezone": "UTC"
	},
	"commands": {
		"daily": {
			"instances": true
		}
	}
}
```

Now simpler commands:

```bash
gbusage daily
gbusage monthly
```

## Configuration File Locations

gbusage searches for configuration files in these locations (in priority order):

1. **Local project**: `.gbusage/gbusage.json` (higher priority)
2. **User config**: `~/.claude/gbusage.json` or `~/.config/claude/gbusage.json` (lower priority)

Configuration files are merged in priority order, with local project settings overriding user settings.
If you pass a custom config file using `--config`, it will override both local and user configs.
Note that configuration files are not required; if none are found, gbusage will use built-in defaults.
Also, if you have multiple config files, only the first one found will be used.

## Basic Configuration

Create a `gbusage.json` file with your preferred defaults:

```json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"json": false,
		"mode": "auto",
		"offline": false,
		"timezone": "Asia/Tokyo",
		"locale": "ja-JP",
		"breakdown": true
	}
}
```

## Configuration Structure

### Schema Support

Add the `$schema` property to get IntelliSense and validation in your IDE:

```json
{
	"$schema": "https://gbusage.com/config-schema.json"
}
```

You can also reference a local schema file after installing gbusage:

```json
{
	"$schema": "./node_modules/gbusage/config-schema.json"
}
```

### Global Defaults

The `defaults` section sets default values for all commands:

```json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"since": "20250101",
		"until": "20250630",
		"json": false,
		"mode": "auto",
		"debug": false,
		"debugSamples": 5,
		"order": "asc",
		"breakdown": false,
		"offline": false,
		"timezone": "UTC",
		"locale": "en-CA",
		"jq": ".data[]"
	}
}
```

### Command-Specific Configuration

Override defaults for specific commands using the `commands` section:

```json
{
	"$schema": "https://gbusage.com/config-schema.json",
	"defaults": {
		"mode": "auto",
		"offline": false
	},
	"commands": {
		"daily": {
			"instances": true,
			"breakdown": true
		},
		"blocks": {
			"active": true,
			"tokenLimit": "500000"
		}
	}
}
```

## Command-Specific Options

### Daily Command

```json
{
	"commands": {
		"daily": {
			"instances": true,
			"project": "my-project",
			"breakdown": true,
			"since": "20250101",
			"until": "20250630"
		}
	}
}
```

### Weekly Command

```json
{
	"commands": {
		"weekly": {
			"startOfWeek": "monday",
			"breakdown": true,
			"timezone": "Europe/London"
		}
	}
}
```

### Monthly Command

```json
{
	"commands": {
		"monthly": {
			"breakdown": true,
			"mode": "calculate",
			"locale": "en-US"
		}
	}
}
```

### Session Command

```json
{
	"commands": {
		"session": {
			"id": "abc123-session",
			"project": "my-project",
			"json": true
		}
	}
}
```

### Blocks Command

```json
{
	"commands": {
		"blocks": {
			"active": true,
			"recent": false,
			"tokenLimit": "max",
			"sessionLength": 5,
			"live": false,
			"refreshInterval": 1
		}
	}
}
```

### Statusline

```json
{
	"commands": {
		"statusline": {
			"offline": true,
			"cache": true,
			"refreshInterval": 2
		}
	}
}
```

## Custom Configuration Files

Use the `--config` option to specify a custom configuration file:

```bash
# Use a specific configuration file
gbusage daily --config ./my-config.json

# Works with all commands
gbusage blocks --config /path/to/team-config.json
```

This is useful for:

- **Team configurations** - Share configuration files across team members
- **Environment-specific settings** - Different configs for development/production
- **Project-specific overrides** - Use different settings for different projects

## Configuration Example

For a complete configuration example, see [`/gbusage.example.json`](/gbusage.example.json) in the repository root, which demonstrates:

- Global defaults configuration
- Command-specific overrides
- All available options with proper types

## Configuration Priority

Settings are applied in this priority order (highest to lowest):

1. **Command-line arguments** (e.g., `--json`, `--offline`)
2. **Custom config file** (specified with `--config /path/to/config.json`)
3. **Local project config** (`.gbusage/gbusage.json`)
4. **User config** (`~/.config/claude/gbusage.json`)
5. **Legacy config** (`~/.claude/gbusage.json`)
6. **Built-in defaults**

Example:

```json
// .gbusage/gbusage.json
{
	"defaults": {
		"mode": "calculate"
	}
}
```

```bash
# Config file sets mode to "calculate"
gbusage daily  # Uses mode: calculate

# But CLI argument overrides it
gbusage daily --mode display  # Uses mode: display
```

## Debugging Configuration

Use the `--debug` flag to see configuration loading details:

```bash
# Debug configuration loading
gbusage daily --debug

# Debug custom config file
gbusage daily --debug --config ./my-config.json
```

Debug output shows:

- Which config files are checked and found
- Schema and option details from loaded configs
- How options are merged from different sources
- Final values used for each option

Example debug output:

```
[gbusage] ℹ Debug mode enabled - showing config loading details

[gbusage] ℹ Searching for config files:
  • Checking: .gbusage/gbusage.json (found ✓)
  • Checking: ~/.config/claude/gbusage.json (found ✓)
  • Checking: ~/.claude/gbusage.json (not found)

[gbusage] ℹ Loaded config from: .gbusage/gbusage.json
  • Schema: https://gbusage.com/config-schema.json
  • Has defaults: yes (3 options)
  • Has command configs: yes (daily)

[gbusage] ℹ Merging options for 'daily' command:
  • From defaults: mode="auto", offline=false
  • From command config: instances=true
  • From CLI args: debug=true
  • Final merged options: {
      mode: "auto" (from defaults),
      offline: false (from defaults),
      instances: true (from command config),
      debug: true (from CLI)
    }
```

## Best Practices

### Version Control

For project configs, commit `.gbusage/gbusage.json` to version control:

```bash
# Add to git
git add .gbusage/gbusage.json
git commit -m "Add gbusage configuration"
```

### Document Team Configs

Add comments using a README alongside team configs:

```
team-configs/
├── gbusage.json
└── README.md  # Explain configuration choices
```

## Troubleshooting

### Config Not Being Applied

1. Check file location is correct
2. Verify JSON syntax is valid
3. Use `--debug` to see loading details
4. Ensure option names match exactly

### Invalid JSON

Use a JSON validator or IDE with JSON support:

```bash
# Validate JSON syntax
jq . < gbusage.json
```

### Schema Validation Errors

Ensure option values match expected types:

```json
{
	"defaults": {
		"tokenLimit": "500000", // ✅ String or number
		"active": true, // ✅ Boolean
		"refreshInterval": 2 // ✅ Number
	}
}
```

## Related Documentation

- [Command-Line Options](/guide/cli-options) - Available CLI arguments
- [Environment Variables](/guide/environment-variables) - Environment configuration
- [Configuration Overview](/guide/configuration) - Complete configuration guide
