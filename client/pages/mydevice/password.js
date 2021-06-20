import { useState } from 'react';
import Image from 'next/image';
import ChangeForm from '../../components/password/change-form';

const Password = () => {
    const [loading, setLoading] = useState(true);

    const doneLoading = () => {
        setLoading(false);
    };


    return (
        <div className="container is-max-desktop mt-5">
            <div className={`pageloader is-light is-bottom-to-top ${loading ? 'is-active' : ''}`}><span className="title">Loading...</span></div>
            <div className='box columns is-centered'>
                <div className="column is-one-third"> 
                    <figure onLoad={() => doneLoading()} className="image is-16by9">
                        <Image src="/register_begin.png" layout="fill"/>
                    </figure>
                </div>
                <div className="column is-flex is-flex-direction-column">
                    <ChangeForm/>
                </div>
            </div>
        </div>
    );
}

// Redirect if not logged in
Password.getInitialProps = async (appContext, user) => {
    if(!user && appContext.res) {
        appContext.res.writeHead(302, {
            Location: '/auth/signin'
          });
          appContext.res.end();
          return;
    }
    return;
};

export default Password;