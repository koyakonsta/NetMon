import { Utils } from "@nativescript/core";
import { XMLParser } from "fast-xml-parser";

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  // Forces 'host' to always be an array even if only 1 device is found
  isArray: (name:string) => ["host", "address", "hostname"].includes(name),
};

export interface NmapHost {
  status: { state : string };
  address: NmapAddress | NmapAddress[];
  hostnames?: {
    hostname: { name: string; type: string } | { name: string; type: string }[];
  };
}

export interface NmapRoot {
  nmaprun: {
    host: NmapHost[]; // Nmap returns an object if 1 host, array if multiple
  };
}

export interface NmapAddress {
  addr: string;
  addrtype: "ipv4" | "mac";
  vendor?: string; // Often present for MAC addresses
}


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

export function runNmapScan() {
  try {
    const {ip, prefix} = getNetworkDetails() ?? {};
    const context = Utils.ad.getApplicationContext();
    const libDir = context.getApplicationInfo().nativeLibraryDir;
    const nmapPath = `${libDir}/libnmap.so`;
    const command = `${nmapPath} --min-parallelism 100 --max-rtt-timeout 333ms -T4 -PR -PS443 -PA80 -PE -PP -sn -oX - ${ip}/${prefix}`;
    const envp = [`LD_LIBRARY_PATH=${libDir}`, `NMAPDIR=${libDir}`];

    const process = java.lang.Runtime.getRuntime().exec(command, envp);

    // Read Output
    const scanner = new java.util.Scanner(process.getInputStream(), "UTF-8").useDelimiter("\\A");
    const stdout = scanner.hasNext() ? scanner.next() : ""; scanner.close();

    const parser = new XMLParser(options);
    const xmlToJson: NmapRoot = parser.parse(stdout);

    // Accessing the data
    const hosts = xmlToJson.nmaprun.host || [];

    // hosts.forEach(h => {
    //   const ip = h.address.find(a => a["@_addrtype"] === "ipv4")?.["@_addr"];
    //   const vendor = h.address.find(a => a["@_addrtype"] === "mac")?.["@_vendor"] || "Unknown";
    //   console.log(`Device: ${ip} (${vendor})`);
    // });

    process.waitFor();

    console.log(`${hosts[0]}`);
    return hosts;

  } catch (e) {
    console.error("Execution failed: ", e);
  }
}


