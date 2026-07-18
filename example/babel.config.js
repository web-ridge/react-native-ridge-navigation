module.exports = function (api) {
  api.cache(true);

  // babel-preset-expo also compiles the library's src/ pulled in through the
  // metro alias, so no react-native-builder-bob babel wrapper is needed here
  // (its `overrides` pattern breaks Expo's cache-key probe, which loads the
  // babel config without a filename).
  return {
    presets: ['babel-preset-expo'],
  };
};
