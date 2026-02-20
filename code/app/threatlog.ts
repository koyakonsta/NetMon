import {File, Utils} from "@nativescript/core";
const fs = require("fs");
const context: Worker = self as any;

context.onmessage = (msg: MessageEvent<string>) => {
  const context = Utils.ad.getApplicationContext();
  const filesDir = context.getFilesDir().getAbsolutePath();
  const filename = `${filesDir}/threats.log`;
  console.log(filename);
  const file = File.fromPath(filename);
  const output = new Date(Date.now()).toISOString() + " > " + msg.data + "\n";
  file.appendTextSync(output, (err: any) => {
    if (err) {
      console.error(err);
    }
  }, "utf-8");
};

