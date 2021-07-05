// config-overrides.js
const {
  addWebpackAlias,
  babelInclude,
  fixBabelImports,
  override,
  addWebpackModuleRule,
} = require('customize-cra');
const pak = require('../package.json');
const path = require('path');
const root = path.resolve(__dirname, '..');

const modules = Object.keys({
  ...pak.peerDependencies,
});
const extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});
module.exports = override(
  fixBabelImports('module-resolver', {
    alias: {
      ...extraNodeModules,
      '^react-native$': 'react-native-web',
    },
  }),
  addWebpackAlias({
    // ...resolver.extraNodeModules,
    // 'react-native-navigation': 'react-native-web',
    // here you can add extra packages
  }),
  addWebpackModuleRule({
    test: /\.(js|jsx|ts|tsx)$/,
    include: path.resolve(root, 'src'),
    use: 'babel-loader',
  }),

  babelInclude([
    root,
    path.resolve('src'),
    path.resolve('app.json'),
    // any react-native modules you need babel to compile
    // e.g.  path.resolve('./node_modules/react-native-vector-icons'),
  ])
);
