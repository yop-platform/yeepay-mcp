module.exports = function (api) {
  const isTest = api.env('test'); // Check if NODE_ENV is 'test'

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        // Keep ESM for non-test environments, convert to CJS for Jest tests
        modules: isTest ? 'auto' : false,
      },
    ],
    '@babel/preset-typescript',
  ];

  return {
    presets,
  };
};