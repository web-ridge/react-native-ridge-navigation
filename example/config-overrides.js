// config-overrides.js
const {
  addWebpackAlias,
  babelInclude,
  fixBabelImports,
  override,
  removeModuleScopePlugin,
  addWebpackModuleRule,
} = require('customize-cra');
const path = require('path');
module.exports = override(
  fixBabelImports('module-resolver', {
    alias: {
      '^react-native$': 'react-native-web',
    },
  }),
  removeModuleScopePlugin(),
  addWebpackAlias({
    // ...resolver.extraNodeModules,
    // 'react-native-navigation': 'react-native-web',
    // here you can add extra packages
  }),
  addWebpackModuleRule({
    test: /\.(png|jpe?g|gif)$/,
    options: {
      name: 'static/media/[name].[hash:8].[ext]',
      scalings: { '@3x': 1 },
    },
    loader: 'react-native-web-image-loader',
  }),
  babelInclude([
    path.resolve('../src'),
    path.resolve('src'),
    path.resolve('app.json'),
    // any react-native modules you need babel to compile
    // e.g.  path.resolve('./node_modules/react-native-vector-icons'),
  ])
);
