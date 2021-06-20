
const StepConnect = () => {

    return(
        <div className="content">
            <article className="message is-info">
                <div className="message-header">
                    <p>Placement considerations</p>
                </div>
                <div className="message-body">
                        <li>Locate your Internet provider device. You will have to connect your Meraki device to this provider device using the network cable.</li>
                        <li>You will also need a power outlet to plug the Meraki device power adapter.</li>
                </div>
            </article>
            <p>Now, you are going to need to connect the Meraki device to your home Internet network. Follow these steps to do so:</p>
            <ol>
                <li>Plug one end of the network cable to any free port on your Internet provider device.</li>
                <li>Plug the other end of the network cable to the port labeled as "Internet" on your Meraki device.</li>
                <li>Connect the power adapter to the corresponding Meraki device port. Conect then the power adapter to a power outlet.</li>
                <li>Press the button on the back of your Meraki to power on the device.</li>

            </ol>
            <p className="has-text-weight-bold">Move to the next step now you have placed and connected your device.</p>
        </div>
    );
};

export default StepConnect;