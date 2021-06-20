import { useState, useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const ChangeForm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [validPassword, setValidPassword] = useState(false);
    const [modalOpen, setModalOpen] = useState(true);
    const [status, setStatus] = useState('not-sent');

    const {doRequest, errors} = useRequest({
        url: '/api/passwords',
        method: 'put',
        body: {newPassword: newPassword}
    });

    // Status button helper
    const buttonHelper = {
        'not-sent': {
            class: 'is-link',
            content: 'Change Password'
        },
        'pending': {
            class: 'is-link is-loading',
            content: 'Loading'
        },
        'success': {
            class: 'is-success',
            content: (
                <span className={"icon is-small"}>
                        <i className="fas fa-check"></i>
                </span>
            )
        }
    };

    // Both passwords should match
    const passwordValidator = () => {
        // Can force password best practices in the future - Right now it can't contain spaces
        if (newPassword == passwordVerify && /^\S{8,63}$/gm.test(newPassword)) {
            setValidPassword(true);
            return;
        }
        else setValidPassword(false);
    };

    // Validation o password on re-render
    useEffect(() => {
        passwordValidator();
    }, [newPassword, passwordVerify]);

    const onSubmit = async (event) => {
        event.preventDefault();

        setStatus('pending');
        await doRequest();

        // Validate that no errors were received to allow re-sending
        console.log(errors);
        if (!errors.length) {
            setStatus('success');
            // completed();
            return;
        }
        else {
            setStatus('not-sent');
        }

    }

    return(
        <>
        <div className={`modal ${modalOpen ? 'is-active' : ''}`}>
                <div className="modal-background" onClick={() => setModalOpen(false)}></div>
                <div className="modal-content box">
                    <h1 className="title is-3">Before you begin:</h1>
                    <p>
                        Before changing your Wi-Fi password, make sure you are not connected to your Family Wi-Fi Network. This will otherwise lead into an automatic disconnection of your device after the change.
                    </p>
                    <hr className="navbar-divider"></hr>
                    <button className="button is-info" onClick={() => setModalOpen(false)}>I understand</button>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={() => setModalOpen(false)}></button>
            </div>
        <div className="content is-flex is-flex-grow-1 is-flex-direction-column mt-2">
            <h1 className="title">Change Your Password:</h1>
            <p className="has-text-weight-semibold">Change the password of your family Wi-Fi network.</p>
            <hr className="navbar-divider"></hr>
            <article className="message is-warning">
                <div className="message-header">
                    <p>Password Requirements</p>
                </div>
                <div className="message-body">
                        <li>Password can not contain any whitespaces.</li>
                        <li>Password must contanin at least 8 characters (and less that 63 characters) long.</li>
                </div>
            </article>
            <div className="is-flex-grow-1">
                <form onSubmit={e => onSubmit(e)}>
                    <div className="field">
                        <label className="label">Enter New Password</label>
                        <div className="control has-icons-right">
                            <input 
                                className="input"
                                type="password" 
                                placeholder="New password"
                                value={newPassword || ''}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <span className={`icon is-small is-right ${validPassword ? '' : 'is-invisible'}`}>
                                <i className="fas fa-check"></i>
                            </span>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Repeat New Password</label>
                        <div className="control has-icons-right">
                            <input 
                                className={`input ${validPassword ? 'is-success' : 'is-danger'}`}
                                type="password" 
                                placeholder="New password"
                                value={passwordVerify || ''}
                                onChange={(e) => setPasswordVerify(e.target.value)}
                            />
                            <span className={`icon is-small is-right ${validPassword? '' : 'is-invisible'}`}>
                                <i className="fas fa-check"></i>
                            </span>
                        </div>
                    </div>
                    {errors}
                    <nav className="level">
                        <div className="level-left">
                            <div className="level-item">
                                <button className={`button ${buttonHelper[status].class}`} disabled={(!validPassword || (status == 'success'))}>{buttonHelper[status].content}</button>
                            </div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">
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
                            </div>
                        </div>
                    </nav>
                </form>
            </div>
        </div>
        </>
    );
};

export default ChangeForm;