import {globalState} from "~/store";
import {getVendor} from 'mac-oui-lookup';
export {getVendor};


export const options = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  // Forces 'host' to be an array
  isArray: (name:string) => ["host", "address", "hostname"].includes(name),
};

export interface NmapHost {
  status: { state : string };
  address: NmapAddress[];
  hostnames?: {
    hostname: { name: string; type: string }[];
  };
  vendor: string | null | undefined;
  riskScore: number;
  isSafe: boolean;
}

export interface NmapRoot {
  nmaprun: {
    host: NmapHost[];
  };
}

export interface NmapAddress {
  addr: string;
  addrtype: string;
  vendor?: string; // Often present for MAC addresses
}

(()=>{
  const intrfcs = java.net.NetworkInterface.getNetworkInterfaces();
  while (intrfcs.hasMoreElements()) {
    const intrfc = intrfcs.nextElement();
    globalState.networkInterfaces.push(intrfc.getName());
  }
})();

export function getNetworkDetails() {
  const interfaces = java.net.NetworkInterface.getNetworkInterfaces();
  while (interfaces.hasMoreElements()) {
    const ix = interfaces.nextElement();
    const addresses = ix.getInterfaceAddresses(); // Returns list of InterfaceAddress

    for (let i = 0; i < addresses.size(); i++) {
      const addr = addresses.get(i);
      const inetAddress = addr.getAddress();

      // find first IPv4, ignoring loopbacks
      if (!inetAddress.isLoopbackAddress() && inetAddress instanceof java.net.Inet4Address) {
        return {
          ip: inetAddress.getHostAddress(),
          prefix: addr.getNetworkPrefixLength() // Returns number like 24
        };
      }
    }
  }
  return null;
}



