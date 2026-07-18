// Used by jest and by react-native-builder-bob (configFile: true on the
// commonjs/module targets).
//
// The published lib intentionally ships WITHOUT React Compiler output:
// compiled output pins a compiler-runtime strategy, and consuming apps that
// run the compiler themselves (with a different React target) end up with
// mismatched hook orders inside library components. Apps get compiler
// coverage of the library by compiling from source (see the example, which
// runs Expo's reactCompiler experiment), and CI still enforces the
// react-hooks compiler diagnostics via eslint.
module.exports = {
  presets: ['module:react-native-builder-bob/babel-preset'],
};
