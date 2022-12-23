const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = function androidMaterialYouBottomBarPlugin(config) {
  return withAndroidStyles(config, async (config) => {
    const styleFile = config.modResults;
    const appTheme = styleFile.resources.style.find(
      (style) => style.$.name === 'AppTheme'
    );
    appTheme.$.parent = 'Theme.Material3.DayNight.NoActionBar';

    return config;
  });
};
