
const Welcome = ({message}) => {
    return(
        <div className="block message is-primary">
            <div className="message-body">
                <h1 className="title">{message}</h1>
            </div>
        </div>
    );
}

export default Welcome;