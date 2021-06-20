import { useState, useEffect } from 'react';
import axios from 'axios';
// import useRequest from '../hooks/use-request';
import Tile from '../components/tile';
import Device from '../components/device';
import Welcome from '../components/welcome';

const Index = () => {
    const [deviceName, setDeviceName] = useState('');
    const [deviceStatus, setDeviceStatus] = useState('');
    const [pageStatus, setPageStatus] = useState('standard');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user device information
        const doRequest = async () => {
            const {data} = await axios.get('/api/devices');
            // If no device, the set the page status to "initial" to trigger this workflow
            if (!data) {
                setPageStatus('initial');
                setLoading(false);
            }
            else {
                setDeviceName(data.serialNumber);
                if (!data.network.networkId) {
                    setDeviceStatus('pending');
                }
                else setDeviceStatus('registered');

                // Set page status to "ready" to show all workflows
                setPageStatus('standard');
                setLoading(false);
            }
        };
        doRequest();
    }, []);


    // Depending on pageStatus render different options
    return (
        <> 
            <div className={`pageloader is-light is-bottom-to-top ${loading ? 'is-active' : ''}`}><span className="title">Loading...</span></div>
            <div className="container mt-5">
            { pageStatus == 'initial' && (
                <>
                <Welcome message="Welcome! Let's get you started - Register your device below" />
                <div className="tile is-ancestor">
                    <div className="tile is-3 is-parent" />
                    <div className="tile is-6 is-parent">
                        <Tile 
                            title="Register My Device"
                            text="Register your device on the cloud using following this simple step-by-step tutorial. Once the registration is done, you will be able to monitor it and change your family's Wi-Fi password."
                            buttonText="Go!"
                            buttonHref="/device/register"
                            imageSrc="/meraki_teleworker.png"
                            imageAlt="meraki_device"
                        />
                    </div>
                    <div className="tile is-3 is-parent" />
                </div>
                </>
            )}
            { pageStatus == 'standard' && (
                <>
                <Welcome message="Hey there! Choose an option below:" />
                <div className="tile is-ancestor">
                    <div className="tile is-parent">
                        <Tile 
                            title="My Device"
                            text="View your devices details, or change it for a new one"
                            buttonText="Go!"
                            buttonHref="/mydevice/edit"
                            imageSrc="/meraki_device.png"
                            imageAlt="meraki_device"
                            childComponent = {<Device deviceName={deviceName} deviceStatus={deviceStatus} />}
                        />
                    </div>
                    <div className="tile is-parent">
                        <Tile 
                                title="Change Wi-Fi Password"
                                text="Set a new password for your family network"
                                buttonText="Go!"
                                buttonHref="/mydevice/password"
                                imageSrc="/wifi_password.png"
                                imageAlt="wifi_password"
                            />
                    </div>
                </div>
                </>
            )}
            </div>
        </>
    );
}

// Redirect if not logged in
Index.getInitialProps = async (appContext, user) => {
    if(!user && appContext.res) {
        appContext.res.writeHead(302, {
            Location: '/auth/signin'
          });
          appContext.res.end();
          return;
    }
    return;
};

export default Index;