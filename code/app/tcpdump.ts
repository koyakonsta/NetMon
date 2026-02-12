import { Utils } from "@nativescript/core"

export function getRoot() {
  try {
    java.lang.Runtime.getRuntime().exec("su")
    console.log("Successfully got root!")
  } catch (e) {
    console.error("root execution failed: ", e)
  }
}

export function copyBinary() {
  try {
    const context = Utils.ad.getApplicationContext()
    const libDir = context.getApplicationInfo().nativeLibraryDir
    const filesDir = context.getFilesDir().getAbsolutePath()
    const srcPath = `${libDir}/libtcpdump.so`
    const destPath = `${filesDir}/tcpdump`
    const srcFile = new java.io.File(srcPath)
    const destFile = new java.io.File(destPath)
    const input = new java.io.FileInputStream(srcFile)
    const output = new java.io.FileOutputStream(destFile)
    const buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.class.getField("TYPE").get(null), 8192);
    let bytesRead
    while ((bytesRead = input.read(buffer)) > 0) {
      output.write(buffer, 0, bytesRead)
    }
    input.close()
    output.flush()
    output.close()
    console.log("Copied tcpdump to data directory")
  } catch (e) {
    console.error("copy operation failed: ", e)
  }
}

export function setExecutable() {
  try {
    const context = Utils.ad.getApplicationContext()
    const filesDir = context.getFilesDir().getAbsolutePath()
    let command = Array.create(java.lang.String, 3)
    command[0] = "su"
    command[1] = "-c"
    command[2] = `sh -c "chmod 755 ${filesDir}/tcpdump"`
    const process = new java.lang.ProcessBuilder(command).start()
    // read any error output
    const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getErrorStream()))
    let line = ""
    while ((line = reader.readLine()) !== null) {
      console.log("chmod stderr: " + line)
    }
    process.waitFor()
    console.log("Set tcpdump as executable")
  } catch (e) {
    console.error("chmod operation failed: ", e)
  }
}
