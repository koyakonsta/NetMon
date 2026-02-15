import "@nativescript/core/globals";
const context: Worker = self as any;

const _self = (self as any);
_self.process = require('process/browser');
_self.Buffer = require('buffer').Buffer;

if (typeof (self as any).process === 'undefined') {
  (self as any).process = require('process/browser');
}

// MANUAL PATCH FOR UTIL.INHERITS
const util = require('util/');
if (typeof util.inherits !== 'function') {
  util.inherits = require('inherits');
}
_self.util = util; // Attach it to global scope

const { PassThrough, Readable } = require('stream-browserify');
import { Utils, File, knownFolders, path } from "@nativescript/core";
const pcapp = require('pcap-parser');

context.onmessage = (_: any) => {
  try {
    console.log('YARRRRRRRRRRRRRRRR');
    const context = Utils.ad.getApplicationContext()
    const filesDir = context.getFilesDir().getAbsolutePath()
    const libDir = context.getApplicationInfo().nativeLibraryDir;
    const tcpDumpPath = `${libDir}/libtcpdump.so`

    // const fifo = `${filesDir}/tcpdump.fifo`;
    const command = `${tcpDumpPath} -i wlan0 -n -U -w -`; //make fifo and write in tcpdump packets
    const process = java.lang.Runtime.getRuntime().exec("su");
    const os = new java.io.DataOutputStream(process.getOutputStream())
    os.writeBytes(`${command}\n`); os.flush(); //exec
    java.lang.Thread.sleep(500);
    const is = process.getInputStream();

    // const fileCheck = new java.io.File(fifo);
    // console.log(`FIFO exists: ${fileCheck.exists()}, Readable: ${fileCheck.canRead()}\n${filesDir}`);

    // const fis = new java.io.FileInputStream(new java.io.File(fifo));
    const bis = new java.io.BufferedInputStream(is);
    const javaBuffer = Array.create("byte", 4096);
    // const streamBridge = new PassThrough({ highWaterMark: 1 }); streamBridge.resume();
    const nodeStream = new Readable({
      read() { /* Node calls this when it wants data, but we push manually */ }
    });

// add the missing methods that pcap-parser is crying about
    nodeStream.pause = () => { console.log("Parser requested pause"); };
    nodeStream.resume = () => { console.log("Parser requested resume"); };

// pass  to parser
    const parser = pcapp.parse(nodeStream);
    nodeStream.resume();

    parser.on('packet', (p: any) => {
      console.log("PACKET FOUND!");
      postMessage(p);
    });
    parser.on('error', (err: any) => {
      console.error("PCAP PARSER ERROR:", err);
    });
    const q = () => {
      try {
        const bytesRead = bis.read(javaBuffer);
        if (bytesRead !== -1) {
          const chunk = Buffer.from(javaBuffer).slice(0, bytesRead);

          // This is the "Magic" line: push data into the Node stream
          nodeStream.emit('data', chunk);

          console.log("PUMPED:", bytesRead);
          // java.lang.Thread.sleep(500); q();

          setTimeout(q, 0);
        }
      } catch (e) {
        console.error("Pump Error:", e);
      }
    }; q();


    // setInterval(()=>{}, 1000);
    // process.waitFor()
  } catch (e) {
    console.error("Execution failed: ", e);
  }
}
