const config = {
    'credentials': {
        'tenantID': process.env.AZURE_TENANT_ID!,
        'clientID': process.env.AZURE_CLIENT_ID!,
        'audience': process.env.AZURE_CLIENT_ID!,
        'clientSecret': process.env.AZURE_CLIENT_SECRET!,
    },
    'resource': {
        'scope': ['access_as_user']
    },
    'metadata': {
        'authority': 'login.microsoftonline.com',
        'discovery': '.well-known/openid-configuration',
        'version': 'v2.0'
    },
    'settings': {
        'validateIssuer': true,
        'passReqToCallback': true,
        'loggingLevel': 'warn'
    }
}

export default config;