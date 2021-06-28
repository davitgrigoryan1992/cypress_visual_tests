let percyHealthCheck = require('@percy/cypress/task')

module.exports = (on, config) => {
    on("task", percyHealthCheck);

    // putting baseUrl in .env.json file based on:
    // https://github.com/cypress-io/cypress/issues/909#issuecomment-578505704

    const baseUrl = config.env.BASE_URL || null;

    if (baseUrl) {
      config.baseUrl = baseUrl;
    }

    return config;
};
