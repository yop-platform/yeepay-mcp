export default {
  // preset: 'ts-jest/presets/default-esm', // Remove preset
  testEnvironment: 'node',
  // extensionsToTreatAsEsm: ['.ts'], // Remove this - run tests in CJS mode
  moduleNameMapper: { // 保留 moduleNameMapper 以防万一
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Configure ts-jest for CJS output, letting Babel handle the CJS conversion
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false, // Ensure ts-jest doesn't output ESM
        tsconfig: 'tsconfig.json', // Explicitly point to tsconfig
        babelConfig: true, // Keep Babel config enabled for CJS conversion
      },
    ],
    // Remove babel-jest transform for JS files
    // '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // 忽略 node_modules，但 @yeepay/yop-typescript-sdk 除外 (已修正)
    '/node_modules/(?!@yeepay/yop-typescript-sdk)',
    '\\.pnp\\.[^\\/]+$',
  ],
};
