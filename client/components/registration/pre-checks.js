import { useState } from 'react';

const PreChecks = ({formSubmit}) => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    return(
        <div className="content">
            <div className={`modal ${modalOpen ? 'is-active' : ''}`}>
                <div className="modal-background" onClick={() => setModalOpen(false)}></div>
                <div className="modal-content box">
                    <h1 className="title is-3">Terms and Conditions</h1>
                    <p>
                        This is the legal agreement you acknowledge when you use this application.
                        Here we explain how we use you're data.....
                    </p>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={() => setModalOpen(false)}></button>
            </div>
            <h1 className="title">Before You Begin...</h1>
            <p>Before getting started, make sure you've done the following:</p>
            <ol>
                <li>Get the Cisco box IT sent you <span className="has-text-weight-bold">(don't open it yet!)</span>.</li>
                <li>Take a look at the <a onClick={() => setModalOpen(true)}>Terms & Conditions</a>. You have to accept them in order to proceed.</li>
            </ol>
            <hr className="navbar-divider"></hr>
            <form onSubmit={formSubmit}>
                <div className="field">
                    <div className="control">
                        <label className="checkbox">
                        <input 
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={e => setTermsAccepted(e.target.checked)}
                        />
                        <span className="ml-1">I have read and agree to the terms and conditions</span>
                        </label>
                    </div>
                </div>
                <button className="button is-link" disabled={!termsAccepted}>Begin</button>
            </form>
        </div>
    );
};

export default PreChecks;