const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Buffer polyfill 추가
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: require.resolve('buffer'),
};

module.exports = config;
