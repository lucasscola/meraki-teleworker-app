import axios, { AxiosInstance, AxiosResponse } from 'axios';

// TypeScript interfaces
interface Organization {
    id: string;
    name: string;
    url: string;
}
interface Network {
    id: string;
    name: string;
    tags: Array<string>;
}

interface VPNHubs {
    hubId: string;
    useDefaultRoute: string;
}

class MerakiClient {
    client: AxiosInstance;
    apiToken: string;
    organizationId: string;

    constructor(apiToken?:string) {
        if (apiToken) {
            this.client = axios.create({
                baseURL: 'https://api.meraki.com/api/v1',
                headers: {
                    'X-Cisco-Meraki-API-Key': apiToken
                },
            });

            this.apiToken = apiToken;
        }
        else {
            this.client = axios.create({
                baseURL: 'https://api.meraki.com/api/v1',
            });
            this.apiToken = '';
        }
        this.organizationId = '';
    };

    setApiToken = (apiToken: string) => {
        this.client.defaults.headers.common['X-Cisco-Meraki-API-Key'] = apiToken;
        this.apiToken = apiToken;
    };

    setOrgId = async (organizationName: string) => {
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }

        // Call API and get OrganizationId
        const response = await this.client.get('/organizations');
        const organizations: Array<Organization> = response.data;
        const organization = organizations.find(org => org.name == organizationName);
        if (organization) {
            this.organizationId = organization.id;
            return;
        }
        else {
            throw new Error('OrgId not found for the specified OrgName');
        }
    };

    checkDeviceSN = async (serialNumber: string) => {
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }
        // Check for orgId before  making any request
        if (!this.organizationId) {
            throw new Error('OrganizationId not defined');
        }

        // Use inventory API to check if SN is found:
        let response: AxiosResponse;
        try {
            response = await this.client.get(`/organizations/${this.organizationId}/inventoryDevices/${serialNumber}`);
            if (response.status == 200) {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    changeSSIDName = async (networkId: string, ssidNumber: string, newName: string) => {
        // NOTE this function uses v0 API, so base URI is different
        // To Be Modified when Meraki adds support for MX/Z devices wireless configs on a newer API version

        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }

        let response: AxiosResponse;
        try {
            response = await this.client.put(`https://api.meraki.com/api/v0/networks/${networkId}/ssids/${ssidNumber}`, {
                name: newName,
                enabled: true
            });
            if (response.status == 200) {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    // getVPNHubs retreives the Hubs configured on the provided blueprint
    getVPNHubs = async (blueprintId: string) => {
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }
        // Check for orgId before  making any request
        if (!this.organizationId) {
            throw new Error('OrganizationId not defined');
        };

        const response = await this.client.get(`/networks/${blueprintId}/appliance/vpn/siteToSiteVpn`);
        if (response.status != 200) {
            throw new Error('Error retreiving blueprint VPN information.');
        };

        if (response.data.mode != "spoke") {
            throw new Error('Blueprint is not configured as spoke. Check blueprint.'); 
        };

        return response.data.hubs;
    };

    // setVPN re-configures the VPN of the network adding Hubs and putting the provided subnet into the tunnel
    setVPN = async (networkId: string, hubs: Array<VPNHubs>, subnet: string) => {
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }
        // Check for orgId before  making any request
        if (!this.organizationId) {
            throw new Error('OrganizationId not defined');
        };

        // Validate Hubs array. It has to provide at least one Hub
        if (hubs.length == 0) {
            throw new Error('Error configuring Sit-to-Site VPN. Please provide at least one Hub');
        }

        // Push the VPN configuration
        let response: AxiosResponse;
        try {
            response = await this.client.put(`/networks/${networkId}/appliance/vpn/siteToSiteVpn`, {
                mode: 'spoke',
                hubs: hubs,
                subnets: [
                    {
                        localSubnet: subnet,
                        useVpn: true
                    }
                ]
            });
            if (response.status == 200) {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            throw new Error(error.message);
        }

    };

    // Call API and get BlueprintId based on userGroup
    getBlueprintId = async (blueprintName:string) => {
        
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }
        // Check for orgId before  making any request
        if (!this.organizationId) {
            throw new Error('OrganizationId not defined');
        }

        // Call API and get blueprint networkId
        const response = await this.client.get(`/organizations/${this.organizationId}/networks`);
        const networks: Array<Network> = response.data;
        const blueprint = networks.find(network => network.name == blueprintName);
        if (blueprint) {
            return blueprint.id;
        }
        else {
            return null;
        }
    };

    createNetworkFromBlueprint = async (blueprintName:string, userAD:string, subnet: string) => {
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }
        // Check for orgId before  making any request
        if (!this.organizationId) {
            throw new Error('OrganizationId not defined');
        }

        // Obtain blueprintId
        const blueprintId = await this.getBlueprintId(blueprintName);
        if (!blueprintId) {
            throw new Error(`No blueprintId found. Check your Meraki Dashboard for blueprint ${blueprintName}`);
        }

        // Call create network API (clone from blueprint)

        let response = await this.client.post(`/organizations/${this.organizationId}/networks`, {
            copyFromNetworkId: blueprintId,
            name: userAD,
            productTypes: [
                'appliance'
            ],
            tags: ['teleworker', blueprintName]
        });
        if (response.status != 201) {
            throw new Error('Failure to create new Network.'); //Invalid user or blueprint? Se supone que debería haberse validado antes
        }

        const newNetworkId = response.data.id;
        // With network created, change the Corporate subnet to prevent overlapping (subnets going on VPN tunnels)
        // Requires Corporate VLAN = 10

        // Appliance IP is the first in the subnet
        const subnetIPs = subnet.split('/')[0].split('.');
        subnetIPs[3] = (parseInt(subnetIPs[3]) + 1).toString();
        const applianceIP = subnetIPs.join('.');

        response = await this.client.put(`networks/${newNetworkId}/appliance/vlans/10`, {
            subnet: subnet,
            applianceIp: applianceIP
        });

        // Reconfigure Site-to-Site VPN to Hub putting VLAN 10 in the VPN
        const hubs = await this.getVPNHubs(blueprintId);
        if (await this.setVPN(newNetworkId, hubs, subnet)) {
            console.log('Reconfigured VPN from template');
        }
        else {
            console.log('VPN from template couldn\'t be reconfigured');
        };

        return newNetworkId;
    };

    addDevice = async (serialNumber:string, networkId:string) => {
        
        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }

        // Call Add device API
        const response = await this.client.post(`/networks/${networkId}/devices/claim`, {
            serials: [serialNumber]
        });
        
        if (response.status == 200) {
            return;
        }
        else {
            throw new Error('Failure to add the device to the Network. Check SN or networkId');
        }
    };

    changePassword = async (networkId:string, ssidNumber: string, newPassword:string) => {
        // NOTE this function uses v0 API, so base URI is different
        // To Be Modified when Meraki adds support for MX/Z devices wireless configs on a newer API version

        // Check for headers before  making any request
        if (!this.apiToken) {
            throw new Error('apiToken not defined. Check for headers');
        }

        // Call add device API to modify WiFi settings (Password / SSID?)
        // API: /networks/{networkId}/wireless/ssids/{number}
        let response: AxiosResponse;
        try {
            response = await this.client.put(`https://api.meraki.com/api/v0/networks/${networkId}/ssids/${ssidNumber}`, {
                psk: newPassword
            });
            if (response.status == 200) {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
};

export default new MerakiClient();