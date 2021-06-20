import axios from 'axios';

const BuildClient = ({req}) => {
    // Check if running on server or client
    if (typeof window === 'undefined') {
        // Server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });

    } else {
        // Client (Browser)
        return axios.create({
            baseURL: '/',
        });
    }
}

export default BuildClient;