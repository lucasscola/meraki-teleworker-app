// Modification in NextJS to poll for changes in files, for more consistency when running in Docker container
module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        domain: process.env.APP_DOMAIN,
        clientId: process.env.AZURE_CLIENT_ID,
        tenantId: process.env.AZURE_TENANT_ID,
      }
}