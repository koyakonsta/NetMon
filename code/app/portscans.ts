import {addRiskScore, getTimestamp, packetHeader} from "~/packets";
import {sendNotification} from "~/notifications";

// portActivity[sourceIP] = [{port, host, timestamp}]
const portActivity = new Map<string, { port: number, host: string, timestamp: number }[]>;
let tick_id: number | null;

function SYN_tick(){ //call every 10sec to test for suspicious activity and clear port activity entries
  for (const [device, activities] of portActivity.entries()) {
    if (activities.length >= 40) {
      const message = "Device " + device + " sent " + activities.length +  " SYN requests in 10 seconds.";
      console.warn(message);
      sendNotification("Network Scan Detected", message, device);
      addRiskScore(device, 10, "Network Scan");
    }
    const portSet = new Set<number>;
    const hostSet = new Set<string>;
    for (const activity of activities) {
      portSet.add(activity.port);
      hostSet.add(activity.host);
    }
    if (portSet.size >= 10) {
      const message = "Device " + device + " sent requests to " + portSet.size + " ports within 10 seconds.";
      console.warn(message);
      sendNotification("Port Scan Detected", message, device);
      addRiskScore(device, 10, "Port Scan");
    }
    if (hostSet.size >= 10) {
      const message = "Device " + device + " sent requests to " + hostSet.size + " hosts within 10 seconds.";
      console.warn(message);
      sendNotification("Ping Sweep Detected", message, device);
      addRiskScore(device, 10, "Ping Sweep");
    }
    portActivity.delete(device);
  }
}

export function tick_start(){
  if (tick_id==null) {
    tick_id = setInterval(SYN_tick, 10 * 1000); // setup up and run tick if not already started
  }
}
tick_start();

export function tick_stop(){
  if (tick_id!==null) { //stop and reset tick
    clearInterval(tick_id);
    tick_id = null;
  }
}

export function storeSYNInfo(header: packetHeader, sourceIP: string, destinationIP: string, destinationPort: number) {
  let deviceActivity = portActivity.get(sourceIP)??[];
  portActivity.set(sourceIP, deviceActivity);
  deviceActivity.push({port: destinationPort, host: destinationIP, timestamp: getTimestamp(header)});
  // console.log(sourceIP + JSON.stringify(deviceActivity));
}
