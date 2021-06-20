import { useState } from 'react';
import Router from 'next/router';
import RegisterForm from './register-form';
import StepConnect from './step-connect';
import StepFinish from './step-finish';
import StepPower from './step-power';
import StepUnbox from './step-unbox';

const RegisterSteps = ({step, nextSubmit, formData, currentUser}) => {
    const [data, setData] = useState({});
    const [stepCompleted, setStepCompleted] = useState(false);

    // Text content for each step
    const helperContent = {
        1: 'Take a look at the box you have received. You will find the Serial Number (SN) in one of the sides. Enter this number below and once is valid click the "Register!" button.',
        2: 'While your device gets configured on the cloud you can now open the box and follow these steps to install your device.',
        3: 'While your device gets configured on the cloud you can now open the box and follow these steps to install your device.',
        4: 'While your device gets configured on the cloud you can now open the box and follow these steps to install your device.',
        5: "Great, all set!"
    };

    // Callback to mark a step as completed
    const complete = () => {
        setStepCompleted(true);
    };

    // Child element for each step
    const childElement = {
        1: (<RegisterForm completed={complete} />),
        2: (<StepUnbox />),
        3: (<StepConnect />),
        4: (<StepPower />),
        5: (<StepFinish username={currentUser.email.split('@')[0]} />),
    };

    const lastStep = Object.keys(helperContent).length;


    return(
        <>
        <div>
                <ul className="steps">
                    <li className={`steps-segment ${(step == 1 ? 'is-active' : '')}`}>
                        <span className="steps-marker" >1</span>
                    </li>
                    <li className={`steps-segment ${(step == 2 ? 'is-active' : '')}`}>
                        <span className="steps-marker">2</span>
                    </li>
                    <li className={`steps-segment ${(step == 3 ? 'is-active' : '')}`}>
                        <span className="steps-marker">3</span>
                    </li>
                    <li className={`steps-segment ${(step == 4 ? 'is-active' : '')}`}>
                        <span className="steps-marker">4</span>
                    </li>
                    <li className={`steps-segment ${(step == 5 ? 'is-active' : '')}`}>
                        <span className="steps-marker is-hollow">
                            <span className="icon"><i className="fa fa-check"></i></span>
                        </span>
                    </li>
                </ul>
            </div>
        <div className="content is-flex is-flex-grow-1 is-flex-direction-column mt-2">
            <h1 className="title">Step {step}:</h1>
            <p className="has-text-weight-semibold">{helperContent[step]}</p>
            <hr className="navbar-divider"></hr>
            <div className="is-flex-grow-1">
                {childElement[step]}
            </div>
            <hr className="navbar-divider"></hr>
            <nav className="level">
                <div className="level-item">
                    {(step < lastStep) &&
                        <button 
                        className="button is-success" 
                        disabled={!stepCompleted}
                        onClick={e => nextSubmit(e)}
                        >
                            <span>Next</span><span className="icon is-small"><i className="fas fa-arrow-right"></i></span>
                        </button>
                    }
                    {(step == lastStep) &&
                        <div 
                        onClick={() => Router.push('/')}
                        className="button is-outlined" 
                        disabled={(status == 'pending')}
                        >
                            <span className="icon is-small">
                                <i className="fas fa-arrow-left"></i>
                            </span>
                            <span>Back to Main Menu</span>
                        </div>
                    }
                </div>
            </nav>
        </div>
        </>
    );
};

export default RegisterSteps;