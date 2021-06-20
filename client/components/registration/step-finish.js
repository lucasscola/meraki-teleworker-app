import NetworkDetails from '../network_details';

const StepFinish = ({username}) => {

    return(
        <div className="content">
            <p>If everything went well, you should see your device with a solid white light. Take note of your new network details below:</p>
            <NetworkDetails 
                type="is-info" 
                title="Your Work Wi-Fi network"
                comment="Remember that only your work laptop can connect to this network"
                ssid={username + '_Corporate'}
                password="Your work credentials"
            />
            <NetworkDetails 
                type="is-info" 
                title="Your Family Wi-Fi network"
                ssid={username + '_Home'}
                password="dummy123"
            />
        </div>
    );
};

export default StepFinish;