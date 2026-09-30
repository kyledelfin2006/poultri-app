const { existsSync } = require('node:fs');
const { join } = require('node:path');

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(existsSync(join(__dirname, 'google-services.json')) ? { googleServicesFile: './google-services.json' } : {}),
  },
});
