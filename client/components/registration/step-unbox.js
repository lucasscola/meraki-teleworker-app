import { useState } from 'react';

const StepUnbox = ({formSubmit}) => {

    return(
        <div className="content">
            <p>Inside the box, get the three most important items:</p>
            <ol>
                <li>Your new Cisco Meraki device</li>
                <li>The power adapter</li>
                <li>The network cable</li>
            </ol>
            <p>Take a look at the video for help.</p>
        </div>
    );
};

export default StepUnbox;