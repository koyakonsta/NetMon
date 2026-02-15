import {XMLParser} from "fast-xml-parser";
import {getNetworkDetails, NmapRoot, options, getVendor} from "~/netutils";
import "@nativescript/core/globals";
import {Utils} from "@nativescript/core";
const context: Worker = self as any;



context.onmessage = (msg) => {
  try {
    const {ip, prefix} = getNetworkDetails() ?? {};
    console.log(ip, prefix);
    const context = Utils.ad.getApplicationContext();
    const libDir = context.getApplicationInfo().nativeLibraryDir;
    const nmapPath = `${libDir}/libnmap.so`;
    const command = `${nmapPath} --send-eth --min-parallelism 50 --max-rtt-timeout 400ms -T4 -PR -PS443 -PA80 -PE -PP -sn -oX - ${ip}/${prefix}`;
    const envp = [`LD_LIBRARY_PATH=${libDir}`, `NMAPDIR=${libDir}`];

    const process = java.lang.Runtime.getRuntime().exec("su", envp);

    // I/O streams
    const os = new java.io.DataOutputStream(process.getOutputStream());

    // exec nmap
    os.writeBytes(`${command}\nexit\n`); os.flush();

    // read stdout
    const scanner = new java.util.Scanner(process.getInputStream(), "UTF-8").useDelimiter("\\A");
    const stdout = scanner.hasNext() ? scanner.next() : ""; scanner.close();
    console.log(stdout);

    const parser = new XMLParser(options);
    const xmlToJson: NmapRoot = parser.parse(stdout);

    // parse xml
    let hosts = xmlToJson.nmaprun.host || [];
    //add vendor mac lookup
    hosts = hosts.map(h => ({...h, vendor:getVendor(h.address.find(i => i.addrtype=='mac')?.addr??"", "N/A")}))

    process.waitFor();

    // return hosts;
    postMessage(hosts);
  } catch (e) {
    console.error("Execution failed: ", e);
  }
};
