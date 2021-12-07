const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function (config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    perf_hooks: false,
  };

  config.module.rules.push({
    test: /\.ttf$/,
    type: 'asset/resource',
  });

  config.plugins.push(new MonacoWebpackPlugin());

  return config;
};
