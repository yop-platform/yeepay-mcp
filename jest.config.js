export default {
  preset: 'ts-jest/presets/default-esm', // 恢复 ts-jest ESM 预设
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], // 明确 .ts 为 ESM
  moduleNameMapper: { // 保留 moduleNameMapper 以防万一
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // 使用 ts-jest 转换 .ts/.tsx 文件，启用 ESM 并使用 Babel 配置
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        babelConfig: true, // 确保 ts-jest 使用 babel.config.cjs
      },
    ],
    // 使用 babel-jest 转换 .js/.jsx 文件 (处理 SDK)
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // 忽略 node_modules，但 @yeepay/yop-typescript-sdk 除外 (已修正)
    '/node_modules/(?!@yeepay/yop-typescript-sdk)',
    '\\.pnp\\.[^\\/]+$',
  ],
};
