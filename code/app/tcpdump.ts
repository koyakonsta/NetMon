import { Utils } from "@nativescript/core"

export function getRoot() {
  try {
    java.lang.Runtime.getRuntime().exec("su")
    console.log("Successfully got root!")
  } catch (e) {
    console.error("root execution failed: ", e)
  }
}

export function getPackets() {
  try {
    const context = Utils.ad.getApplicationContext()
    const libDir = context.getApplicationInfo().nativeLibraryDir
    const tcpDumpPath = `${libDir}/libtcpdump.so`
    const command = `${tcpDumpPath} -i wlan0 -n -l -e -tt`
    const envp = [`LD_LIBRARY_PATH=${libDir}`]
    const process = java.lang.Runtime.getRuntime().exec(command, envp)
    console.log("Launched tcpdump")

    // read output
    const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()))
    let line = ""
    while ((line = reader.readLine()) !== null) {
      console.log("tcpdump output: " + line)
    }
    process.waitFor()
  } catch (e) {
    console.error("tcpdump execution failed: ", e)
  }
}
