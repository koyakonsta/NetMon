import {Utils} from "@nativescript/core";
import {XMLParser} from "fast-xml-parser";
import {getNetworkDetails, NmapRoot} from "~/netutils";
import "@nativescript/core/globals";
const context: Worker = self as any;

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  // Forces 'host' to be an array
  isArray: (name:string) => ["host", "address", "hostname"].includes(name),
};

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

    // 2. Setup input and output streams
    const os = new java.io.DataOutputStream(process.getOutputStream());

    // 3. Write your command and exit the root shell immediately after
    os.writeBytes(`${command}\nexit\n`); os.flush();

    // Read Output
    const scanner = new java.util.Scanner(process.getInputStream(), "UTF-8").useDelimiter("\\A");
    const stdout = scanner.hasNext() ? scanner.next() : ""; scanner.close();
    console.log(stdout);

    const parser = new XMLParser(options);
    const xmlToJson: NmapRoot = parser.parse(stdout);

    // Accessing the data
    const hosts = xmlToJson.nmaprun.host || [];

    process.waitFor();

    // return hosts;
    postMessage(hosts);
  } catch (e) {
    console.error("Execution failed: ", e);
  }
};
