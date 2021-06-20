# Meraki Self-Service Portal

A web portal intended to be used by end users that receive Meraki gear at their homes. It eases IT work by allowing customers to self register their devices. It also allows editing the personal SSID password for their family use.

Backend for the application is written in NodeJS, frontend is written in NextJS.

## How it works

## Supported Meraki Devices

The devices supported for onboarding are the following:
* Z1
* Z3
* MX64/MX64W
* MX67/MX67W
* MX68/MX68W

## Configuration in Meraki Dashboard

### <a name="meraki_pre"></a>Prerequisites
First, make sure you have defined the Meraki Organization that is going to be used to place all the Networks. You need an API Key that is able to work with that organization (check [Enable API Access](https://documentation.meraki.com/General_Administration/Other_Topics/Cisco_Meraki_Dashboard_API#Enable_API_access) for instructions).

Add at least one of these devices to the Meraki Dashboard Org before creating the Blueprints so that all configuration options are available.

### <a name="meraki_blueprints"></a>Creating network blueprints
Networks for each user type are cloned from Blueprints. You need to define one blueprint for each Azure AD group that you want to map with the application.
Blueprints are created like regular networks on Meraki Dashboard. Just take note of the name for each blueprint, you are going to need them to configure the application later.

**Note on Wireless Settings for Z/MX devices:** In order to be able to configure and re-use Wireless Settings, the current version of the application requires that you claim one device on each Blueprint. There is a Meraki Dashboard limitation where you are not going to be able to see and configure "Security Appliance" Wireless Settings on a network unless there is a device attached that supports this feature. We are working on an enhancement for a future release.

### <a name="meraki_inventory"></a>Add devices to the Organization Inventory
Last, make sure all your Meraki devices are already added to the Organization inventory before the application begins the automated creation of networks (check [Claiming Devices](https://documentation.meraki.com/General_Administration/Inventory_and_Devices/Using_the_Organization_Inventory#Claiming_Devices) for help).

## Configuration in Azure AD

In Azure there are some configurations needed to integrate the Teleworker App. First, define which Azure AD tenant to use, and get the Azure Tenant ID. You can find it on the Tenant Information, on the Overview Page when the tenant is selected, or use [this guide](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant) for more details.

The application relies on User Groups for defining which Blueprint is the right one for each user. This is the main use case.
Now for the integration to work two applications have to be created on the Azure tenant: one for the backend, one for the frontend. 
Users use frontend application to access the Teleworker App using their Azure AD credentials. Backend application has to validate the token generated after this login in order to generate the internal Teleworker App token that will allow users to access the protected URIs.


### <a name="azure_groups"></a>Getting user groups ready
The application works finding specific Groups IDs inside an Azure AD user. You can create groups specifically for this application or re-use the ones you already use.
Take note of the Group ID for each of these groups and define which group ID will match which Meraki Blueprint name. Write it down, you are going to need this information later at configuration time.

Users that will login to the Teleworker App **must** be part of one (and only one) of the Azure AD groups used. Failing to do so will cause the registration of devices fail, or not work as expected.

### <a name="azure_frontend"></a>Creating the frontend application
Inside Azure AD, and with your Tenant selected, navigate to "App Registrations". Click on "New Registration" to register the frontend application with the following parameters:
- **Name**: your choice
- **Supported account types**: Select “Accounts in this organizational directory only (<tenant> only - Single tenant)”
- **Redirect URI**: Select "Single-page Application" and the write down the following: `https://<your-domain>/auth/sso-success`

Once the application is created, it is time to set the correct permissions. Inside the application page, go to "API permissions". Click on "Add a permission" and the select the following one: "openid".

### <a name="azure_backend"></a>Creating the backend application
Inside Azure AD, and with your Tenant selected, navigate to "App Registrations". Click on "New Registration" to register the backend application with the following parameters:
- **Name**: your choice
- **Supported account types**: Select “Accounts in this organizational directory only (<tenant> only - Single tenant)”
- **Redirect URI**: Leave blank

After the registration of the application, go inside its page and click on "Expose an API" in the menu on the left. Add a new scope clicking the "Add a scope" button. When prompted for an Application ID URI you can leave the default value of choose a new one. After that, fill the form with the following data:
- **Scope name**: your choice, "access_as_user" for example
- **Who can consent?**: Select “Admins only”
- **Admin consent display name**: your choice
- **Admin consent description**: your choice
- **State**: "Enabled"
Save the scope.

Last thing, the Teleworker App needs a Client Secret to integrate the backend with Azure. You need to generate one on the backend application you've just created. Navigate to "Certificates & Secrets" menu and click the "New client secret" button. Choose a name and expiration time of your like, and copy the secret you've just created (the platform will not show it again so make sure you've copied it somewhere, you are going to need this value when configuring your Kubernetes cluster).

### <a name="azure_final"></a>Interaction between frontend and backend Azure applications
You need to allow the frontend application to generate tokens with access to the backend application. To do so, navigate to the frontend application you've created before. Choose the "API permissions" menu.
1. Add a new permissions clicking the "Add a permission" button. 
2. When the panel displays, choose the "My APIs" tab on the top. You should see the API that your backend application is exposing.
3. Select it and save the permission.
4. Once the permission is created, an admin has to grant consent. Click on the "Grant admin consent for *tenant*" button (next to the "Add a permission" button) and accept.

## Cluster preparation

The application runs inside a Kubernetes cluster. To deploy the application, follow the instructions below:

### <a name="k8s_choose"></a>Define the Kubernetes cluster to use
The application was tested in a Local Kubernetes Cluster and in Google Kubernetes Engine, but it should work on any Kubernetes cluster without any problem. Once you have defined the cluster to use, make sure you have access to it using <kubectl>.

### <a name="k8s_ingress"></a>Installing NGINX Ingress on your cluster
To access the application from the outside we use Ingress-NGINX controller. The installation depends on which platform you have the Kubernetes cluster deployed. You can take a look at [Installation Guide - NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/deploy/) to see all the options for every platform out there.

Just as an example, to install it on a GKE cluster you need first to initialize your user as cluster-admin:
~~~
kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole cluster-admin \
  --user $(gcloud config get-value account)
~~~

Then, install the controller as follows:
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.45.0/deploy/static/provider/cloud/deploy.yaml`

### <a name="k8s_secrets"></a>Cluster secrets:
The system requires 3 secrets in the K8s cluster in order to work:

* **jwt-secret** is used to build and to check the JSON Web Tokens used for authentication.
* **azure-secret** the Secret create in [Creating the backend application](#azure_backend) for the backend application integration in Azure AD.
* **meraki-api-key** the API Key generated in your Meraki Organization (in section [Prerequisites](#meraki_pre)). This is used for the communication with Meraki Dashboard.

The following table decribes the key and values needed. Please validate the key name at the time of configuring them.
| Key                 | Value                                                                                        |
|---------------------|----------------------------------------------------------------------------------------------|
| JWT_KEY             | *Any key, this is shared among the different backend services*                               |
| AZURE_CLIENT_SECRET | *The client secret for the application integration in Azure AD*                              |
| MERAKI_API_TOKEN    | *Your Meraki API Key, with access to the organization where Networks are going to be created*|

To configure each Secret use <kubectl>, replacing <<your_key>> with the corresponding value:
~~~
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<your_key>
kubectl create secret generic azure-secret --from-literal=AZURE_CLIENT_SECRET=<your_key>
kubectl create secret generic meraki-api-key --from-literal=MERAKI_API_TOKEN=<your_key>
~~~

## Configuration

### <a name="config_backend"></a>Application backend customization
The files that need to be modified for each user deployment are found inside the folder `infra/k8s-prod/configMaps`.
Change the following keys on the corresponding file:

**On file auth-conf.yaml:**
- AZURE_TENANT_ID: put your Azure App Tenant ID
- AZURE_CLIENT_ID: put your Backend Azure App Client ID

**On file devices-conf.yaml:**
- SUPERNET: define the network that will be automatically subneted with the creation of each new Meraki Teleworker network.
- PREFIX_LENGTH: the prefix length of each Corporate network deployed at a teleworker site.

**On file gateway-conf.yaml:**
- MERAKI_ORGANIZATION_NAME: The name of the Meraki Organization the Application should connect to. This is the organization that has the blueprints configured and the devices in the inventory.

**On file blueprints-conf.yaml:**
Here you will find a `blueprints.json` entry. Inside this entry you have to put the mapping between the Azure AD group ID and its corresponding Meraki Blueprint name. Entries has to be placed as an array with the format `[<AzureAD-group-id>, <Meraki-blueprint, name>]`. You will find some dummy examples in the file as guide. Don't forget the comma at the end of each entry!

### <a name="config_frontend"></a>The web client
If you are only using the application backend, you can skip this step. Because of how NextJS works, the client can't be modified with a configMap. So you will have to change the ENV in the Dockerfile inside the `client` folder and then rebuild the container. After rebuild, push it to a private Docker repo (the Dockerfile has keys, so use a private repo) and tell Kubernetes Deployment to use that image for the client. The detailed steps are below:

First, open `client/Dockerfile` file and modify the following lines:
- **NEXT_PUBLIC_APP_DOMAIN**: Put your Teleworker App domain. This domain has to fit with the one you use in Azure AD at the time of registering the frontend application.
- **NEXT_PUBLIC_AZURE_CLIENT_ID**: The Application (client) ID of the frontend application you've created in Azure AD.
- **NEXT_PUBLIC_AZURE_BACKEND_CLIENT_ID**: The Application (client) ID of the backend application you've created in Azure AD.
- **NEXT_PUBLIC_AZURE_TENANT_ID**: The Tenant ID of the Azure AD tenant you are integrating this application with.

Then, build the container and push it to your private repository. For example, in the `client` directory:

~~~
docker build -t <repo>/<tag> .
docker push <repo>/<tag>
~~~

After that, open the `infra/k8s/client-depl.yaml` and edit the `image` field with the container you just push to the repo. Depending on where you run the K8s cluster, and where the container registry is located, you may need to do additional work to grant the cluster access to the private repository. I used GCP container registry and GKE to host the cluster so that no extra step is needed. You can also use a local K8s cluster with local Docker images.

Save the file and apply the deployment to your K8s cluster to create the client.


## Throubleshooting

This section needs to be written. You can always check the logs of each container to see what may be not working.