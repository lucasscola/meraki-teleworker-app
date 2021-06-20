
const Device = ({deviceName, deviceStatus}) => {
    // Check status and set correct tag type
    const tagType = (deviceStatus === 'registered') ? 'is-success' : 'is-warning';

    return(
        <div>
            <hr className="navbar-divider"></hr>
            <p>Your current registered device is:</p>
            <p className="has-text-weight-bold">{deviceName}<span className={`tag ml-1 ${tagType}`}>{deviceStatus}</span></p>
        </div>
    );
};

export default Device;