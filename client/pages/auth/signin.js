import { useState } from 'react';
import Router from 'next/router';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../../src/authConfig";
import useRequest from '../../hooks/use-request';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localAuth, setLocalAuth] = useState(false);

    // Azure AD auth
    const { instance } = useMsal();
    const azureLogin = () => {
        instance.loginRedirect(loginRequest);
    };

    const { doRequest, errors} = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {email, password},
        onSuccess: () => Router.push('/')
    });

    const  onSubmit = async (event) => {
        event.preventDefault();
        doRequest();

    };

    if (!localAuth) {
        return (
            <div className="is-flex is-flex-direction-column is-justify-content-center">
                <div className="box container mb-1">
                    <div className="title has-text-centered">
                        Let's get started!
                    </div>
                    <div className="subtitle has-text-centered">
                        Log in with your Company credentials:
                    </div>
                    <div className="buttons mt-5 is-centered">
                        <div className="button is-primary" onClick={() => azureLogin()}>Sign in</div>
                    </div>
                </div>
                <div className="container">
                    <a onClick={() => setLocalAuth(true)} className="button is-small is-link is-inverted">Log in with local credentials</a>
                </div>
                <div className="container box has-text-centered mt-6">
                    <p>
                        Made with <span className="icon"><i className="fas fa-heart"></i></span> by Chiara Pietra and Lucas Scola
                    </p>
                </div>
            </div>
        );
    };

    if (localAuth) {
        return (
            <div className="is-flex is-flex-direction-column is-justify-content-center mt-5">
                <div className="box container mb-1">
                    <div className="title has-text-centered">
                        Let's get started!
                    </div>
                    <div className="subtitle has-text-centered">
                        Insert your credentials below:
                    </div>
                    <form onSubmit={onSubmit}>
                            <div className="field">
                                <label className="label">Email</label>
                                <div className="control">
                                    <input 
                                        className="input" 
                                        type="email" 
                                        placeholder="e.g. alex@mydomain.com" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Password</label>
                                <div className="control">
                                    <input 
                                        className="input" 
                                        type="password" 
                                        placeholder="*****"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="block">
                            {errors}
                            </div>
                            <div className="buttons mt-5 is-centered">
                                <button className="button is-primary">Sign in</button>
                            </div>
                    </form>
                </div>
                <div className="container">
                    <a onClick={() => setLocalAuth(false)} className="button is-small is-link is-inverted">Log in company credentials</a>
                </div>
                <div className="container box has-text-centered mt-6">
                    <p>
                        Made with <span className="icon"><i className="fas fa-heart"></i></span> by Chiara Pietra and Lucas Scola
                    </p>
                </div>
            </div>
        );
    }
};

// Redirect if already logged in
// Signin.getInitialProps = async (appContext, user) => {
//     if(user && appContext.res) {
//         appContext.res.writeHead(302, {
//             Location: '/'
//           });
//           appContext.res.end();
//           return;
//     }
//     return;
// };

export default Signin;