import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useState, useEffect } from 'react';
import Router from 'next/router';
import 'bulma/css/bulma.css';
import 'bulma-pageloader';
import 'bulma-o-steps/bulma-steps.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/global.css'
import buildClient from '../api/build-client';
import Header from '../components/header';
import { msalConfig } from "../src/authConfig";

// Initializing MSAL library for Azure AD auth
const msalInstance = new PublicClientApplication(msalConfig);

const AppComponent = ({ Component, pageProps, user }) => {
    return (
        <MsalProvider instance={msalInstance}>
            <div className="">
                    <Header currentUser={user}/>
            </div>
            <section className="hero is-fullheight-with-navbar">
                <div className="hero-body">
                    <div className="container">
                            <Component currentUser={user} {...pageProps} />
                    </div>
                </div>
            </section>
        </MsalProvider>
    );
};

// Get info with Next (from the server) before rendering the component. 
// Also cannot use hooks as useRequest() because this function is not a component
AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    // Fix to call getInitialProps for the actual component
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, data.user); 
    };

    return {
        pageProps,
        ...data
    };
};


export default AppComponent;