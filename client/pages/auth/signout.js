import { useEffect } from 'react';
import Router from 'next/router';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import useRequest from '../../hooks/use-request';

const Signout = () => {
    // Get Azure AD creds to check if SSO was used
    const { instance } = useMsal();
    const azureUser = useIsAuthenticated();
    const { doRequest, errors} = useRequest({
        url: '/api/users/signout',
        method: 'post',
        onSuccess: () => {
            if (azureUser) {
                // Azure AD signout
                instance.logout();
            };
            Router.push('/auth/signin');
        }
    });

    
    useEffect(() => {
        doRequest();
    }, []);

    return(
        <div className="container block mt-5">
            <div className="message is-info">
                <div className="message-body">
                    Signing you out...
                </div>
            </div>
        </div>
    );
}

export default Signout;