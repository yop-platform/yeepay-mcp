# 易宝支付(Yeepay) MCP 服务集成

易宝支付 MCP 服务通过 Model Context Protocol (MCP) 提供与易宝支付服务的集成。

[![npm version](https://img.shields.io/npm/v/yeepay-mcp.svg)](https://www.npmjs.com/package/yeepay-mcp)
[![npm downloads](https://img.shields.io/npm/dm/yeepay-mcp.svg)](https://www.npmjs.com/package/yeepay-mcp)

[Read this document in English](README.md)

## 功能

- `create_webpage_yeepay_payment`: 创建易宝移动支付订单
  - 必填参数: `orderId` (字符串), `amount` (数字), `goodsName` (字符串), `userIp` (字符串)
- `query_yeepay_payment_status`: 查询易宝支付订单状态
  - 必填参数: `orderId` (字符串)

## 环境要求

- Node.js (推荐LTS版本)
- pnpm (或 npm)

## 安装与配置

### 1. 安装

```bash
# 克隆仓库
git clone https://github.com/yop-platform/yeepay-mcp.git
cd yeepay-mcp

# 安装依赖
npm install
# 或
pnpm install
```

### 2. 配置

复制 `.env.example` 为 `.env` 并配置以下环境变量:

```dotenv
YOP_PARENT_MERCHANT_NO=您的父商户编号
YOP_MERCHANT_NO=您的商户编号
YOP_APP_PRIVATE_KEY=您的私钥
YOP_APP_KEY=您的应用AppKey
YOP_NOTIFY_URL=https://您的域名/yeepay/notify
```

## 使用方式

有多种方式可以运行和使用此 MCP 服务：

### 1. 本地运行

#### 开发模式 (带热重载)

```bash
npm run dev
# 或
pnpm run dev
```

#### 生产模式

```bash
# 构建项目
npm run build
# 或
pnpm run build

# 启动服务
npm start
# 或
pnpm start
```

### 2. Docker 运行

```bash
# 构建镜像
docker build -t yeepay-mcp .

# 运行容器 (确保 .env 文件存在)
docker run -p 3000:3000 --env-file .env yeepay-mcp
```

### 3. 通过 npx 调用

本项目支持通过 `npx` 直接调用。

#### 本地项目调用 (发布前)

在项目目录中运行：

```bash
# 先构建项目
npm run build

# 使用 npx 调用本地包
npx . [参数]
```

或者使用完整路径：

```bash
npx /absolute/path/to/yeepay-mcp [参数]
```

#### 传递参数

你可以向 `npx` 命令传递参数：

```bash
npx . --port 3001 --host 0.0.0.0
```

#### 发布后调用

当项目发布到 npm 注册表后，你可以直接使用：

```bash
npx yeepay-mcp [参数]
```

并且可以指定版本：

```bash
npx yeepay-mcp@0.1.0 [参数]
```

### 4. 作为 MCP 服务集成

可以将此服务集成到支持 MCP 的工具中（如 Cline）。

#### 启动方式

**方式一：包运行器 (推荐)**

```bash
pnpm dlx yeepay-mcp
# 或
npx yeepay-mcp
```

_(注意: 此方式在包发布到 npm 后可用)_

**方式二：Node (本地开发/直接路径)**

```bash
node /path/to/yeepay-mcp/dist/index.js
```

**重要提示:** 无论哪种启动方式，服务运行时都需要能访问工作目录中的 `.env` 文件以获取配置。

#### 在 Cline 中配置

在 Cline 的 MCP 设置文件 (`cline_mcp_settings.json`) 中配置此服务。

**使用 Node 配置 (本地开发或指定路径):**

```json
"yeepay-mcp": {
  "command": "node",
  "args": [
    "/path/to/yeepay-mcp/dist/index.js" // 替换为实际的绝对路径
  ],
  "env": { // 或者将配置放在 .env 文件中，并确保服务能读取到
    "YOP_PARENT_MERCHANT_NO": "您的父商户编号",
    "YOP_MERCHANT_NO": "您的商户编号",
    "YOP_APP_PRIVATE_KEY": "您的私钥",
    "YOP_APP_KEY": "您的应用AppKey",
    "YOP_NOTIFY_URL": "https://您的域名/yeepay/notify"
  },
  "disabled": false,
  "alwaysAllow": []
}
```

**使用 npx 配置 (发布后):**

```json
"yeepay-mcp": {
  "command": "npx",
  "args": [
    "yeepay-mcp" // 包名
    // 可以添加版本号，如 "yeepay-mcp@0.1.0"
    // 也可以添加参数，如 "--port", "3001"
  ],
  "env": { // 同上，env 或 .env 文件
    "YOP_PARENT_MERCHANT_NO": "您的父商户编号",
    "YOP_MERCHANT_NO": "您的商户编号",
    "YOP_APP_PRIVATE_KEY": "您的私钥",
    "YOP_APP_KEY": "您的应用AppKey",
    "YOP_NOTIFY_URL": "https://您的域名/yeepay/notify"
  },
  "disabled": false,
  "alwaysAllow": []
}
```

## 开发指南

### 开发模式

使用热重载进行开发:

```bash
pnpm run dev
# 或
npm run dev
```

使用 inspector 调试：

```bash
npx -y @modelcontextprotocol/inspector node dist/index.js
```

### 提交消息规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来格式化提交消息。每个提交消息都应该遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

其中：

- **type**: 表示提交的类型，如 `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore` 等。
- **scope**: （可选）表示提交影响的范围，如 `core`, `server`, `payment`, `config` 等。
- **goodsName**: 简短描述提交的内容，使用祈使句，现在时态。
- **body**: （可选）详细描述提交的内容，解释修改的原因和方式。
- **footer**: （可选）包含重大变更 (`BREAKING CHANGE:`) 或关闭 issue (`Closes #123`) 的信息。

**示例：**

```
feat(server): add health check endpoint

Add a new endpoint `/health` to check the health status of the server and its dependencies. This helps with monitoring and deployment verification.

Closes #123
BREAKING CHANGE: The configuration format for database connection has changed.
```

项目中已配置 `commitlint` 和 `husky`，会在提交前自动检查提交消息是否符合规范。你可以使用 `.github/commit-template.txt` 作为提交消息的模板。

### 代码风格

本项目使用 ESLint 和 Prettier 来强制执行和保持代码风格的一致性。在提交代码前，会自动运行 `lint-staged` 来检查和格式化暂存区的文件。请确保你的编辑器已配置相应的插件以获得实时反馈。

## 发布流程

### 准备工作

- 确保 `package.json` 中的 `version` 是最新的。
- 确保 `package.json` 中的 `bin` 字段正确指向 `dist/index.js`，以便 `npx` 可以执行。
- 确保所有更改已提交，并且构建是成功的 (`npm run build`)。

### 手动发布到 npm

1. 登录 npm:
   ```bash
   npm login
   ```
2. 发布:
   ```bash
   npm publish
   # 或如果使用 pnpm
   pnpm publish
   ```

### 使用 GitHub Actions 自动发布

本项目配置了 GitHub Actions，可以在创建 GitHub Release 时自动发布到 npm。

1. **创建 GitHub Release**：
   - 在 GitHub 仓库页面，点击 "Releases"。
   - 点击 "Draft a new release" 或 "Create a new release"。
   - 输入与 `package.json` 中版本号匹配的 **Tag version** (例如 `v0.1.0`)。
   - 选择目标分支 (通常是 `main` 或 `master`)。
   - 输入 **Release title** (例如 `Version 0.1.0`)。
   - 添加发布说明 (描述此版本中的更改)。
   - 点击 "Publish release"。

GitHub Actions 将自动触发 `.github/workflows/release.yml` 工作流，构建并将包发布到 npm。

### 版本更新

#### 手动更新版本

使用 `npm version` 命令更新 `package.json` 中的版本号并创建 git tag：

```bash
# 补丁版本更新 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本更新 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本更新 (1.0.0 -> 2.0.0)
npm version major
```

然后推送到 GitHub 并手动发布：

```bash
git push --follow-tags
npm publish
```

#### 使用 semantic-release 自动更新版本 (如果配置)

如果项目配置了 `semantic-release`，则版本更新和发布通常是自动化的，基于 Conventional Commits 规范：

- `fix:` 提交会触发补丁版本更新。
- `feat:` 提交会触发次要版本更新。
- 包含 `BREAKING CHANGE:` 的提交会触发主要版本更新。

合并到主分支后，CI/CD 流程会自动计算版本、打标签、生成发布说明并发布到 npm。

### 发布后的验证

发布成功后，你可以通过以下方式验证：

1. 在 [npm](https://www.npmjs.com/) 网站上搜索你的包名 (`yeepay-mcp`)。
2. 在一个新的空目录中，尝试使用 `npx` 安装并运行你的包：
   ```bash
   npx yeepay-mcp --help # 或其他参数
   ```

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. **Fork** 本仓库到你的 GitHub 账户。
2. **Clone** 你 fork 的仓库到本地：`git clone https://github.com/YOUR_USERNAME/yeepay-mcp.git`
3. 创建一个新的特性分支：`git checkout -b feature/your-amazing-feature`
4. 进行代码修改。
5. 确保遵循提交消息规范提交更改：`git commit -m 'feat: add some amazing feature'`
6. 将你的分支推送到你的 fork：`git push origin feature/your-amazing-feature`
7. 在原始仓库中创建一个 **Pull Request**，描述你的更改。

## 许可证

本项目采用 Apache 许可证。详情请参见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- 在 GitHub 仓库中提交 [Issue](https://github.com/yop-platform/yeepay-mcp/issues)。
- 发送邮件至：dreambt@gmail.com

## 提示

在包发布到 npm 注册表之前，请确保在配置或调用时使用正确的 **本地路径** 或 **绝对路径**，而不是包名，以避免出现 "package was not found" 或类似的错误。
