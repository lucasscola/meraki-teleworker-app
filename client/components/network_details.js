
const NetworkDetails = ({title, comment, ssid, password, type}) => {
    return (
        <article className={`message is-info ${type || 'is-info'}`}>
                <div className="message-header">
                    <p>{title}</p>
                </div>
                <div className="message-body">
                    <p className="has-text-weight-bold">{comment}</p>
                    <div className="field is-horizontal">
                        <div className="field-label is-normal">
                            <label className="label">SSID Name:</label>
                        </div>
                        <div className="field-body">
                            <div className="field">
                                <p className="control">
                                    <input className="input is-static" type="email" value={ssid} readOnly />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label is-normal">
                            <label className="label">Password:</label>
                        </div>
                        <div className="field-body">
                            <div className="field">
                                <p className="control">
                                    <input className="input is-static" type="password" value={password} readOnly />
                                </p>
                            </div>
                        </div>
                    </div>   
                </div>
        </article>
    );
}

export default NetworkDetails