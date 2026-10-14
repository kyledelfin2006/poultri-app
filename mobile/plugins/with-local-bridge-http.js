const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLocalBridgeHttp(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const application = configWithManifest.modResults.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return configWithManifest;
  });
};
