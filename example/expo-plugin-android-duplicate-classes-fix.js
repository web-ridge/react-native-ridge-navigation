const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function androidDuplicateClassesFix(config) {
  return withAppBuildGradle(config, async (config) => {
    console.log('androidDuplicateClassesFix');
    const buildGradle = config.modResults;

    const dependenciesBlockStart =
      buildGradle.contents.indexOf('dependencies {');

    if (dependenciesBlockStart !== -1) {
      // Add the new dependency to the depend
      buildGradle.contents = [
        buildGradle.contents.slice(
          0,
          dependenciesBlockStart + 'dependencies {'.length
        ),
        `
        implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.5.0'
        implementation 'androidx.lifecycle:lifecycle-viewmodel:2.5.0'
        `,
        buildGradle.contents.slice(
          dependenciesBlockStart + 'dependencies {'.length
        ),
      ].join('\n');
    }

    return config;
  });
};
