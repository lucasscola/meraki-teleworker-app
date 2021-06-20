import { useState, useRef } from 'react';
import Image from 'next/image';
import PreChecks from '../../components/registration/pre-checks';
import RegisterSteps from '../../components/registration/register-steps';

const Register = ({currentUser}) => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({});

    const onSubmit = async (event) => {
        event.preventDefault();
        if (step != lastStep) {
            setStep(step + 1);
            return;
        }
    };

    // Media content for each step
    const helperMedia = {
        0: ((step == 0) && <Image src="/register_begin.png" layout="fill"/>),
        1: ((step == 1) && <Image src="/register_sn.png" layout="fill"/>),
        2: ((step == 2) && <Image src="/register_unbox.png" layout="fill"/>),
        3: ((step == 3) && <Image src="/register_connect.png" layout="fill"/>),
        4: ((step == 4) && <Image src="/register_power.png" layout="fill"/>),
        5: ((step == 5) && <Image src="/register_finish.png" layout="fill"/>),
    };

    const renderedMedia = Object.entries(helperMedia).map(
        ([key, value]) => <div key={key}>{value}</div>
    );

    // Child content for each step
    const childContent = {
        0: (<PreChecks formSubmit={onSubmit} />),
        1: (<RegisterSteps step={step} formData={formData} nextSubmit={onSubmit} currentUser={currentUser}/>), // Before you begin
        2: (<RegisterSteps step={step} formData={formData} nextSubmit={onSubmit} currentUser={currentUser}/>), // Register SN
        3: (<RegisterSteps step={step} formData={formData} nextSubmit={onSubmit} currentUser={currentUser}/>), // Unbox
        4: (<RegisterSteps step={step} formData={formData} nextSubmit={onSubmit} currentUser={currentUser}/>), // Connect Ethernet
        5: (<RegisterSteps step={step} formData={formData} nextSubmit={onSubmit} currentUser={currentUser}/>), // Power
    };

    // Set up the last step before submiting the form
    const lastStep = Object.keys(helperMedia).length;

    // Component view depends on step state. Step 0 is "before you begin"
    return (
        <div className="container mt-5">
            <div className={`box columns is-centered ${(step!=0) ? 'is-vcentered' : ''}`}>
                <div className="column"> 
                    <figure className="image is-16by9">
                        {renderedMedia}
                    </figure>
                </div>
                <div className="column is-three-fifths is-flex is-flex-direction-column">
                    {childContent[step]}
                </div>
            </div>
        </div>
    );
}

// Redirect if not logged in
Register.getInitialProps = async (appContext, user) => {
    if(!user && appContext.res) {
        appContext.res.writeHead(302, {
            Location: '/auth/signin'
          });
          appContext.res.end();
          return;
    }
    return;
};

export default Register;