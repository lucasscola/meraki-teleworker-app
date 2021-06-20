import { Address4 } from 'ip-address';

const getNextSubnet = (currentSubnet:string, prefixLength:string, inSubnet?:string) => {
    // Providing a subnet with CIDR notation, e.g. 192.168.100.0/29, it returns the next subnet
    // inSubnet is an optional argument to check if the next subnet belongs to an specific supernet. Resturns null otherwise
    let providedAddress: Address4;

    try {
        providedAddress = new Address4(currentSubnet);
    }
    catch (err) {
        throw new Error(`Error processing provided address: ${err}`);
    }
    if (Number(prefixLength) < 1 || Number(prefixLength) > 32) {
        throw new Error(`Error processing prefix length: ${prefixLength} is not valid`);
    }

    // Use BigInteger to find the next subnet (adding +1 to the broadcast address)
    const lastAddress = providedAddress.endAddress();
    const newBigInteger = lastAddress.bigInteger();
    newBigInteger[0] += 1;
    const newAddress = Address4.fromBigInteger(newBigInteger);
    newAddress.subnet = '/' + prefixLength;
    newAddress.subnetMask = Number(prefixLength);

    // Check if new subnet fits into supernet if inSubnet is provided
    if (inSubnet) {
        if (newAddress.isInSubnet(new Address4(inSubnet))) {
            return newAddress.correctForm() + newAddress.subnet;
        }
        else {
            return null;
        }
    }

    return newAddress.correctForm() + newAddress.subnet;

}

export { getNextSubnet };