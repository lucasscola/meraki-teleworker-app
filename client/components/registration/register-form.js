import { useState } from 'react';
import useRequest from '../../hooks/use-request';

const RegisterForm = ({completed}) => {
    const [serialNumber, setSerialNumber] = useState('');
    const [validSerial, setValidSerial] = useState(false);
    const [status, setStatus] = useState('not-sent');

    // Success functions is the callback for register hook - It will mark the step as completed
    const onSuccess = () => {
        setStatus('success');
        completed();
    };

    const onError = () => {
        setStatus('not-sent');
    };

    const {doRequest, errors} = useRequest({
        url: '/api/devices',
        method: 'post',
        body: {serialNumber: serialNumber},
        onSuccess: onSuccess,
        onError: onError
    });

    // Status button helper
    const buttonHelper = {
        'not-sent': {
            class: 'is-link',
            content: 'Register!'
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
    
    // Serial number validator
    const serialNumberValidator = (serial) => {
        const newSerial = serial.toUpperCase();
        if (newSerial.length < 14) {
            if (newSerial.length % 5 == 4 && newSerial.substr(newSerial.length - 1, 1) !== '-') {
                setSerialNumber(newSerial + '-');
                setValidSerial(false);
                return;
            }
            setSerialNumber(newSerial);
            setValidSerial(false);
            return;
        }
        setSerialNumber(newSerial.substring(0,14));
        // Validate XXXX-XXXX-XXXX format
        if (/^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/.test(newSerial)) {
            setValidSerial(true);
        }
        return;
    }

    const onSubmit = async (event) => {
        event.preventDefault();

        // TODO * Submit form here
        setStatus('pending');
        await doRequest();
    };

    return(
        <form onSubmit={e => onSubmit(e)}>
            <div className="field">
                <label className="label">Serial Number</label>
                <div className="control has-icons-right">
                    <input 
                        className={`input ${validSerial ? 'is-success' : 'is-danger'}`}
                        type="text" 
                        placeholder="XXXX-XXXX-XXXX"
                        value={serialNumber || ''}
                        onChange={(e) => serialNumberValidator(e.target.value)}
                    />
                    {errors}
                    <span className={`icon is-small is-right ${validSerial ? '' : 'is-invisible'}`}>
                        <i className="fas fa-check"></i>
                    </span>
                </div>
            </div>
            <button className={`button ${buttonHelper[status].class}`} disabled={(!validSerial || (status == 'success'))}>{buttonHelper[status].content}</button>
        </form>
    );
};

export default RegisterForm;