# Yeepay MCP Service Integration

The Yeepay MCP service provides integration with Yeepay services via the Model Context Protocol (MCP).

[![npm version](https://img.shields.io/npm/v/@yeepay/yeepay-mcp.svg)](https://www.npmjs.com/package/@yeepay/yeepay-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@yeepay/yeepay-mcp.svg)](https://www.npmjs.com/package/@yeepay/yeepay-mcp)
[![smithery badge](https://smithery.ai/badge/@yop-platform/yeepay-mcp)](https://smithery.ai/server/@yop-platform/yeepay-mcp)

[阅读中文文档](README_zh-CN.md)

## Features

- `create_webpage_yeepay_payment`: Create Yeepay webpage payment order
  - Required parameters: `orderId` (string), `amount` (number), `goodsName` (string), `userIp` (string)
- `query_yeepay_payment_status`: Query Yeepay payment order status
  - Required parameters: `orderId` (string)

## Prerequisites

- Node.js (LTS version recommended)
- pnpm (or npm)

## Installation and Configuration

### Installing via Smithery

To install Yeepay Payment Integration Service for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@yop-platform/yeepay-mcp):

```bash
npx -y @smithery/cli install @yop-platform/yeepay-mcp --client claude
```

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yop-platform/yeepay-mcp.git
cd yeepay-mcp

# Install dependencies
npm install
# or
pnpm install
```

### 2. Configuration

Copy `.env.example` to `.env` and configure the following environment variables:

```dotenv
YOP_PARENT_MERCHANT_NO=Your parent merchant number
YOP_MERCHANT_NO=Your merchant number
YOP_APP_PRIVATE_KEY=Your private key
YOP_APP_KEY=Your application AppKey
YOP_NOTIFY_URL=https://your-domain.com/yeepay/notify
```

## Usage

There are several ways to run and use this MCP service:

### 1. Run Locally

#### Development Mode (with hot-reloading)

```bash
npm run dev
# or
pnpm run dev
```

#### Production Mode

```bash
# Build the project
npm run build
# or
pnpm run build

# Start the service
npm start
# or
pnpm start
```

### 2. Run with Docker

```bash
# Build the image
docker build -t yeepay-mcp .

# Run the container (ensure the .env file exists)
docker run -p 3000:3000 --env-file .env yeepay-mcp
```

### 3. Call via npx

This project supports direct invocation via `npx`.

#### Local Project Invocation (Before Publishing)

Run in the project directory:

```bash
# First, build the project
npm run build

# Use npx to call the local package
npx . [arguments]
```

Or use the full path:

```bash
npx /absolute/path/to/yeepay-mcp [arguments]
```

#### Passing Arguments

You can pass arguments to the `npx` command:

```bash
npx . --port 3001 --host 0.0.0.0
```

#### Invocation After Publishing

Once the project is published to the npm registry, you can use it directly:

```bash
npx yeepay-mcp [arguments]
```

And you can specify a version:

```bash
npx yeepay-mcp@0.1.0 [arguments]
```

### 4. Integrate as an MCP Service

This service can be integrated into tools that support MCP (like Cline).

#### Startup Methods

**Method 1: Package Runner (Recommended)**

```bash
pnpm dlx yeepay-mcp
# or
npx yeepay-mcp
```

_(Note: This method is available after the package is published to npm)_

**Method 2: Node (Local Development/Direct Path)**

```bash
node /path/to/yeepay-mcp/dist/index.js
```

**Important Note:** Regardless of the startup method, the service needs access to the `.env` file in the working directory at runtime to obtain configuration.

#### Configure in Cline

Configure this service in Cline's MCP settings file (`cline_mcp_settings.json`).

**Configure using Node (Local Development or Specific Path):**

```json
"yeepay-mcp": {
  "command": "node",
  "args": [
    "/path/to/yeepay-mcp/dist/index.js" // Replace with the actual absolute path
  ],
  "env": { // Alternatively, place the configuration in the .env file and ensure the service can read it
    "YOP_PARENT_MERCHANT_NO": "Your parent merchant number",
    "YOP_MERCHANT_NO": "Your merchant number",
    "YOP_APP_PRIVATE_KEY": "Your private key",
    "YOP_APP_KEY": "Your application AppKey",
    "YOP_NOTIFY_URL": "https://your-domain.com/yeepay/notify"
  },
  "disabled": false,
  "alwaysAllow": []
}
```

**Configure using npx (After Publishing):**

```json
"yeepay-mcp": {
  "command": "npx",
  "args": [
    "yeepay-mcp" // Package name
    // You can add a version number, e.g., "yeepay-mcp@0.1.0"
    // You can also add arguments, e.g., "--port", "3001"
  ],
  "env": { // Same as above, env or .env file
    "YOP_PARENT_MERCHANT_NO": "Your parent merchant number",
    "YOP_MERCHANT_NO": "Your merchant number",
    "YOP_APP_PRIVATE_KEY": "Your private key",
    "YOP_APP_KEY": "Your application AppKey",
    "YOP_NOTIFY_URL": "https://your-domain.com/yeepay/notify"
  },
  "disabled": false,
  "alwaysAllow": []
}
```

## Development Guide

### Development Mode

Develop with hot-reloading:

```bash
pnpm run dev
# or
npm run dev
```

### Commit Message Convention

This project uses the [Conventional Commits](https://www.conventionalcommits.org/) specification to format commit messages. Each commit message should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Where:

- **type**: Indicates the type of commit, e.g., `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- **scope**: (Optional) Indicates the scope affected by the commit, e.g., `core`, `server`, `payment`, `config`, etc.
- **subject**: Briefly describe the content of the commit, use imperative, present tense.
- **body**: (Optional) Describe the content of the commit in detail, explaining the reason and method of modification.
- **footer**: (Optional) Contains information about breaking changes (`BREAKING CHANGE:`) or closing issues (`Closes #123`).

**Example:**

```
feat(server): add health check endpoint

Add a new endpoint `/health` to check the health status of the server and its dependencies. This helps with monitoring and deployment verification.

Closes #123
BREAKING CHANGE: The configuration format for database connection has changed.
```

The project has configured `commitlint` and `husky` to automatically check if commit messages conform to the specification before committing. You can use `.github/commit-template.txt` as a template for commit messages.

### Git Hooks

This project uses Husky to manage Git hooks:

- **pre-commit**: Runs `lint-staged` to automatically format and lint staged files
- **commit-msg**: Validates commit messages using `commitlint` to ensure they follow the Conventional Commits specification

The hooks are automatically installed when you run `npm install` and do not require any global installation of Husky.

### Code Style

This project uses ESLint and Prettier to enforce and maintain code style consistency. Before committing code, `lint-staged` will automatically run to check and format staged files. Please ensure your editor is configured with the corresponding plugins for real-time feedback.

## Release Process

### Preparation

- Ensure the `version` in `package.json` is up-to-date.
- Ensure the `bin` field in `package.json` correctly points to `dist/index.js` so that `npx` can execute it.
- Ensure all changes are committed and the build is successful (`npm run build`).

### Manual Publishing to npm

1. Log in to npm:
   ```bash
   npm login
   ```
2. Publish:
   ```bash
   npm publish
   # or if using pnpm
   pnpm publish
   ```

### Automatic Publishing with GitHub Actions

This project is configured with GitHub Actions to automatically publish to npm when a GitHub Release is created.

1. **Create GitHub Release**:
   - On the GitHub repository page, click "Releases".
   - Click "Draft a new release" or "Create a new release".
   - Enter a **Tag version** matching the version number in `package.json` (e.g., `v0.1.0`).
   - Select the target branch (usually `main` or `master`).
   - Enter the **Release title** (e.g., `Version 0.1.0`).
   - Add release notes (describe the changes in this version).
   - Click "Publish release".

GitHub Actions will automatically trigger the `.github/workflows/release.yml` workflow to build and publish the package to npm.

### Version Updates

#### Manual Version Update

Use the `npm version` command to update the version number in `package.json` and create a git tag:

```bash
# Patch version update (1.0.0 -> 1.0.1)
npm version patch

# Minor version update (1.0.0 -> 1.1.0)
npm version minor

# Major version update (1.0.0 -> 2.0.0)
npm version major
```

Then push to GitHub and publish manually:

```bash
git push --follow-tags
npm publish
```

#### Automatic Version Update with semantic-release (If Configured)

If the project is configured with `semantic-release`, version updates and publishing are usually automated based on Conventional Commits:

- `fix:` commits trigger a patch version update.
- `feat:` commits trigger a minor version update.
- Commits containing `BREAKING CHANGE:` trigger a major version update.

After merging into the main branch, the CI/CD process automatically calculates the version, creates tags, generates release notes, and publishes to npm.

### Post-Publish Verification

After successful publishing, you can verify in the following ways:

1. Search for your package name (`yeepay-mcp`) on the [npm](https://www.npmjs.com/) website.
2. In a new empty directory, try installing and running your package using `npx`:
   ```bash
   npx yeepay-mcp --help # or other arguments
   ```

## Contributing Guide

Contributions, bug reports, and improvement suggestions are welcome. Please follow these steps:

1. **Fork** this repository to your GitHub account.
2. **Clone** your forked repository locally: `git clone https://github.com/YOUR_USERNAME/yeepay-mcp.git`
3. Create a new feature branch: `git checkout -b feature/your-amazing-feature`
4. Make your code changes.
5. Ensure you follow the commit message convention when committing changes: `git commit -m 'feat: add some amazing feature'`
6. Push your branch to your fork: `git push origin feature/your-amazing-feature`
7. Create a **Pull Request** in the original repository describing your changes.

## License

This project is licensed under the Apache License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please contact us via:

- Submit an [Issue](https://github.com/yop-platform/yeepay-mcp/issues) in the GitHub repository.
- Send an email to: dreambt@gmail.com

## Tip

Before the package is published to the npm registry, ensure you use the correct **local path** or **absolute path** when configuring or calling it, instead of the package name, to avoid errors like "package was not found".
