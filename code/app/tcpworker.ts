import {Utils} from "@nativescript/core";
const context: Worker = self as any;

context.onmessage = (_: any) => {
  try {
    const context = Utils.ad.getApplicationContext()
    const filesDir = context.getFilesDir().getAbsolutePath()
    const tcpDumpPath = `${filesDir}/tcpdump`
    const command = `${tcpDumpPath} -i wlan0 -U -w -`

    const process = java.lang.Runtime.getRuntime().exec("su");
    const os = new java.io.DataOutputStream(process.getOutputStream())
    os.writeBytes(`${command}\nexit\n`)
    os.flush()

    const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()))
    let line = ""
    while ((line = reader.readLine()) !== null) {
      postMessage(line)
      // console.log("tcpdump output: " + line)
    }

    process.waitFor()
  } catch (e) {
    console.error("Execution failed: ", e);
  }
}
