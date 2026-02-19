import {addRiskScore, getTimestamp, packetHeader} from "~/packets";

// portActivity[sourceIP] = [{port, host, timestamp}]
const portActivity = new Map<string, { port: number, host: string, timestamp: number }[]>;
let tick_id: number | null;

function SYN_tick(){ //call every 10sec to test for suspicious activity and clear port activity entries
  for (let [device, activities] of portActivity.entries()) {
    if (activities.length >= 20) {
      // TODO: Send a notification to warn of this
      // TODO: Also prevent the score from being magnified multiple times at once
      console.warn("Device " + device + " sent " + activities.length +  " SYN requests in 10 seconds.");
      addRiskScore(device, 10, "Network Scan");
    }
    portActivity.delete(device);
  }
  // TODO: Add additional tests for cases of >10 unique ports or >10 unique hosts
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
