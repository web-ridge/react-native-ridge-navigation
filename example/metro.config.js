const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const escape = require('escape-string-regexp');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * The library is consumed straight from ../src so editing it fast-refreshes
 * the example (react-native-builder-bob >= 0.40 no longer ships a
 * metro-config helper, so the aliasing lives here).
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.watchFolders = [root];

// Resolve the library name to its source, and its peer dependencies to the
// example's copies so only one React / React Native instance is bundled.
const peers = Object.keys({
  ...pkg.peerDependencies,
  'react': '*',
  'react-native': '*',
});

config.resolver.blockList = peers.map(
  (name) =>
    new RegExp(`^${escape(path.join(root, 'node_modules', name))}\\/.*$`)
);
config.resolver.extraNodeModules = peers.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === pkg.name) {
    return {
      filePath: path.join(root, 'src', 'index.tsx'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
