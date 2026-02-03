import { Utils } from "@nativescript/core";

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
    const command = `${nmapPath} -sn ${ip}/${prefix}`;
    const envp = [`LD_LIBRARY_PATH=${libDir}`, `NMAPDIR=${libDir}`];

    const process = java.lang.Runtime.getRuntime().exec(command, envp);

    // Read Output
    const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()));
    let line = "";
    while ((line = reader.readLine()) !== null) {
      console.log("Nmap Output: " + line);
    }
    process.waitFor();
  } catch (e) {
    console.error("Execution failed: ", e);
  }
}


