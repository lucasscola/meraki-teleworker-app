// import getConfig from 'next/config';
// // Config object to be passed to Msal on creation

// const { publicRuntimeConfig } = getConfig();
const domain = process.env.NEXT_PUBLIC_APP_DOMAIN;
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
const backendClientId = process.env.NEXT_PUBLIC_AZURE_BACKEND_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;

export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        navigateToLoginRequestUrl: false,
        redirectUri: `${domain}/auth/sso-success`,
        postLogoutRedirectUri: `${domain}/auth/signin` 
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: ["openid", `api://${backendClientId}/access_as_user`]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/me"
};
