export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@yeepay/yop-typescript-sdk$': '<rootDir>/tests/__mocks__/@yeepay/yop-typescript-sdk.ts', // Added mapping
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
        babelConfig: true,
      },
    ],
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@yeepay/yop-typescript-sdk)',
    '\\.pnp\\.[^\\/]+$',
  ],
  // Add these settings to improve Jest's handling of mocks
  resetMocks: false,
  restoreMocks: false,
  clearMocks: true,
  // Set up mock paths
  moduleDirectories: ['node_modules', 'tests/__mocks__'],
  // Set up test environment
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  // Set up coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
};
