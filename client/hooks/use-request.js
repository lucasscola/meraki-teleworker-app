import axios from 'axios';
import { useState } from 'react';

const UseRequest = ({ url, method, body, onSuccess, onError }) => {
    const [errors, setErrors] = useState([]);
    
    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            // Dont know the method in advance, so we need to look the axios object for "get", "post", "put", etc.
            const response = await axios[method](url, {...body, ...props}); // props adds additional body properties, passed as doRequest argument
            if (onSuccess) {
                onSuccess(response.data);
            }

        } catch (err) {
            console.log(err);
            setErrors(
            <div className="message is-danger">
                <div className="message-body">
                    <h4>Ooops... something went wrong...</h4>
                    <ul>
                        {err.response.data.errors.map(err => (<li key={err.message}>{err.message}</li>))}
                    </ul>
                </div>
            </div>);
            if (onError) {
                onError(err.response.status);
            }
        };
    };

    return { doRequest, errors};
};

export default UseRequest;