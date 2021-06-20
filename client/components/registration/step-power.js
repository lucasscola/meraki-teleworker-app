
const StepPower = () => {

    return(
        <div className="content">
            <p>Last step, now it's time to power on your device. Follow these steps to do so:</p>
            <ol>
                <li>Connect the power adapter to the corresponding Meraki device port. Conect then the power adapter to a power outlet.</li>
                <li>Press the button on the back of your Meraki to power on the device.</li>
            </ol>
            <p className="has-text-weight-bold">That's it! The Meraki device front light should turn on and start blinking. Take a look at the video for more detailed step-by-step instructions</p>
        </div>
    );
};

export default StepPower;