# Installation

gbusage can be installed and used in several ways depending on your preferences and use case.

## Why No Installation Needed?

Thanks to gbusage's incredibly small bundle size, you don't need to install it globally. Unlike other CLI tools, we pay extreme attention to bundle size optimization, achieving an impressively small footprint even without minification. This means:

- ✅ Near-instant startup times
- ✅ Minimal download overhead
- ✅ Always use the latest version
- ✅ No global pollution of your system

## Quick Start (Recommended)

The fastest way to use gbusage is to run it directly:

::: code-group

```bash [bunx (Recommended)]
bunx gbusage
```

```bash [npx]
npx gbusage@latest
```

```bash [pnpm]
pnpm dlx gbusage
```

```bash [deno]
deno run -E -R=$HOME/.claude/projects/ -S=homedir -N='raw.githubusercontent.com:443' npm:gbusage@latest
```

:::

::: tip Speed Recommendation
We strongly recommend using `bunx` instead of `npx` due to the massive speed difference. Bunx caches packages more efficiently, resulting in near-instant startup times after the first run.
:::

::: info Deno Security
Consider using `deno run` if you want additional security controls. Deno allows you to specify exact permissions, making it safer to run tools you haven't audited.
:::

### Performance Comparison

Here's why runtime choice matters:

| Runtime  | First Run | Subsequent Runs | Notes               |
| -------- | --------- | --------------- | ------------------- |
| bunx     | Fast      | **Instant**     | Best overall choice |
| npx      | Slow      | Moderate        | Widely available    |
| pnpm dlx | Fast      | Fast            | Good alternative    |
| deno     | Moderate  | Fast            | Best for security   |

## Global Installation (Optional)

While not necessary due to our small bundle size, you can still install gbusage globally if you prefer:

::: code-group

```bash [npm]
npm install -g gbusage
```

```bash [bun]
bun install -g gbusage
```

```bash [yarn]
yarn global add gbusage
```

```bash [pnpm]
pnpm add -g gbusage
```

:::

After global installation, run commands directly:

```bash
gbusage daily
gbusage monthly --breakdown
gbusage blocks --live
```

## Development Installation

For development or contributing to gbusage:

```bash
# Clone the repository
git clone https://github.com/ryoppippi/ccusage.git
cd gbusage

# Install dependencies
bun install

# Run directly from source
bun run start daily
bun run start monthly --json
```

### Development Scripts

```bash
# Run tests
bun run test

# Type checking
bun typecheck

# Build distribution
bun run build

# Lint and format
bun run format
```

## Runtime Requirements

### Node.js

- **Minimum**: Node.js 20.x
- **Recommended**: Node.js 20.x or later
- **LTS versions** are fully supported

### Bun (Alternative)

- **Minimum**: Bun 1.2+
- **Recommended**: Latest stable release
- Often faster than Node.js for gbusage

### Deno

Deno 2.0+ is fully supported with proper permissions:

```bash
deno run \
  -E \
  -R=$HOME/.claude/projects/ \
  -S=homedir \
  -N='raw.githubusercontent.com:443' \
  npm:gbusage@latest
```

Also you can use `offline` mode to run gbusage without network access:

```bash
deno run \
  -E \
  -R=$HOME/.claude/projects/ \
  -S=homedir \
  npm:gbusage@latest --offline
```

## Verification

After installation, verify gbusage is working:

```bash
# Check version
gbusage --version

# Run help command
gbusage --help

# Test with daily report
gbusage daily
```

## Updating

### Direct Execution (npx/bunx)

Always gets the latest version automatically.

### Global Installation

```bash
# Update with npm
npm update -g gbusage

# Update with bun
bun update -g gbusage
```

### Check Current Version

```bash
gbusage --version
```

## Uninstalling

### Global Installation

::: code-group

```bash [npm]
npm uninstall -g gbusage
```

```bash [bun]
bun remove -g gbusage
```

```bash [yarn]
yarn global remove gbusage
```

```bash [pnpm]
pnpm remove -g gbusage
```

:::

### Development Installation

```bash
# Remove cloned repository
rm -rf gbusage/
```

## Troubleshooting Installation

### Permission Errors

If you get permission errors during global installation:

::: code-group

```bash [npm]
# Use npx instead of global install
npx gbusage@latest

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

```bash [Node Version Managers]
# Use nvm (recommended)
nvm install node
npm install -g gbusage

# Or use fnm
fnm install node
npm install -g gbusage
```

:::

### Network Issues

If installation fails due to network issues:

```bash
# Try with different registry
npm install -g gbusage --registry https://registry.npmjs.org

# Or use bunx for offline-capable runs
bunx gbusage
```

### Version Conflicts

If you have multiple versions installed:

```bash
# Check which version is being used
which gbusage
gbusage --version

# Uninstall and reinstall
npm uninstall -g gbusage
npm install -g gbusage@latest
```

## Next Steps

After installation, check out:

- [Getting Started Guide](/guide/getting-started) - Your first usage report
- [Configuration](/guide/configuration) - Customize gbusage behavior
- [Daily Reports](/guide/daily-reports) - Understand daily usage patterns
