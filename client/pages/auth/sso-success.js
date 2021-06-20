import {useEffect } from 'react';
import Router from 'next/router';
import { useMsal, useAccount } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import axios from 'axios';
import { loginRequest } from "../../src/authConfig";

const SSOSuccess = () => {
    // Azure AD auth
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});

    useEffect(() => {
        // Get user device information
        const doRequest = async () => {
            // Get token for backend authorization
            const tokenResponse = await instance.acquireTokenSilent({
                ...loginRequest,
                account: account
            });

            const response = await axios.get('/api/users/sso-signin', {headers: {Authorization: `Bearer ${tokenResponse.accessToken}`}});
            // If succesfull and cookie is received, redirect
            if (response.status == 200) {
                Router.push('/');
            };
        }

        if (account && (inProgress == InteractionStatus.None)) {
            doRequest();
        }
    }, [account, inProgress]);

    return (
        <div className="pageloader is-light is-bottom-to-top is-active"><span className="title">Loading...</span></div>
    );

};

// Redirect if already logged in
// SSOSuccess.getInitialProps = async (appContext, user) => {
//     if(user && appContext.res) {
//         appContext.res.writeHead(302, {
//             Location: '/'
//           });
//           appContext.res.end();
//           return;
//     }
//     return;
// };

export default SSOSuccess;