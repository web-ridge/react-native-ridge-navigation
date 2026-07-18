// Used by jest and by react-native-builder-bob (configFile: true on the
// commonjs/module targets): bob's own preset plus React Compiler, so the
// published lib/ is compiler-optimized. `target: '18'` + the
// react-compiler-runtime dependency keeps the output working on React
// 17/18/19.
//
// Metro does NOT read this file — the example app compiles src/ through its
// own babel.config.js (babel-preset-expo with the reactCompiler experiment).
module.exports = {
  presets: ['module:react-native-builder-bob/babel-preset'],
  plugins: [],
};
