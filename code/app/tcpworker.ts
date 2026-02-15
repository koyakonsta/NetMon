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

const { Readable } = require('stream-browserify');
import { Utils } from "@nativescript/core";
const pcapp = require('pcap-parser');

context.onmessage = (_: any) => {
  try {
    console.log("Starting tcpdump worker...")
    postMessage("ready");
    const context = Utils.ad.getApplicationContext()
    const libDir = context.getApplicationInfo().nativeLibraryDir;
    const tcpDumpPath = `${libDir}/libtcpdump.so`

    const command = `killall libtcpdump.so > /dev/null; ${tcpDumpPath} -i wlan0 -n -U -w -`; //make fifo and write in tcpdump packets
    const process = java.lang.Runtime.getRuntime().exec("su");
    const os = new java.io.DataOutputStream(process.getOutputStream())
    os.writeBytes(`${command}\n`); os.flush(); //exec
    java.lang.Thread.sleep(500);
    const is = process.getInputStream();

    const bis = new java.io.BufferedInputStream(is);
    const javaBuffer = Array.create("byte", 4096);
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
      postMessage(p);
    });
    parser.on('error', (err: any) => {
      console.error("pcap parser error:", err);
    });
    const q = () => {
      try {
        const bytesRead = bis.read(javaBuffer);
        if (bytesRead !== -1) {
          const chunk = Buffer.from(javaBuffer).slice(0, bytesRead);

          nodeStream.emit('data', chunk);

          setTimeout(q, 0);
        }
      } catch (e) {
        console.error("Pump Error:", e);
      }
    }; q();
  } catch (e) {
    console.error("Execution failed: ", e);
  }
}
