import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import * as msal from '@azure/msal-node';
import axios from 'axios';
import config from './ssoConfig';

// Passport login strategy
const logging: "warn" = "warn";
const strategyOptions = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.audience,
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    scope: config.resource.scope,
    loggingLevel: logging,
};
const bearerStrategy = new BearerStrategy(strategyOptions, (req, token, done) => {
    // Send user info using the second argument
    const user = {
        id: token.oid,
        email: token.preferred_username
    }
    done(null, user, token);
}
);

passport.use(bearerStrategy);

// MSAL client for getting user information after login
const msalOptions = {
    auth: {
            clientId: config.credentials.clientID,
            authority: `https://${config.metadata.authority}/${config.credentials.tenantID}`,
            clientSecret: config.credentials.clientSecret,
        }
};
const msalInstance = new msal.ConfidentialClientApplication(msalOptions);

// Auxiliary funtion to get user group details. Returns an array [data, errors]
const getUserGroups = async (authorizedToken: string) => {
    // Start getting the correct token
    const oboRequest = {
        oboAssertion: authorizedToken.split(' ')[1],
        scopes: ["user.read", "GroupMember.Read.All"],
    }
    try {
        const tokenResponse = await msalInstance.acquireTokenOnBehalfOf(oboRequest);
        if (!tokenResponse!.accessToken) {
            return [null, 'No access token received'];
        }
        // If able to get token, call GraphAPI
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/memberOf`, {
            headers: { Authorization: `Bearer ${tokenResponse!.accessToken}`}
            });
        return [response.data.value, null];

    }
    catch (err) {
        return [null, err];
    }
};



export {passport, getUserGroups};