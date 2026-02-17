import {addRiskScore, getTimestamp, packetHeader} from "~/packets";

// portActivity[sourceIP] = [{port, host, timestamp}]
const portActivity = new Map<string, { port: number, host: string, timestamp: number }[]>;

function discardOldData() {
  const currentTimestamp = Date.now() / 1000;
  for (const [device, activities] of portActivity.entries()) {
    const filteredActivities = activities.filter((activity) => (currentTimestamp - activity.timestamp) < 10);

    if (filteredActivities.length === 0) {
      portActivity.delete(device);
    } else {
      portActivity.set(device, filteredActivities);
    }
  }
}

export function storeSYNInfo(header: packetHeader, sourceIP: string, destinationIP: string, destinationPort: number) {
  discardOldData();
  let deviceActivity = portActivity.get(sourceIP);
  if (!deviceActivity) {
    deviceActivity = [];
    portActivity.set(sourceIP, deviceActivity);
  }
  deviceActivity.push({port: destinationPort, host: destinationIP, timestamp: getTimestamp(header)});
  // console.log(sourceIP + JSON.stringify(deviceActivity));
  if (deviceActivity.length >= 20) {
    // TODO: Send a notification to warn of this
    // TODO: Also prevent the score from being magnified multiple times at once
    console.warn("Device " + sourceIP + " sent " + deviceActivity.length +  " SYN requests in 10 seconds.");
    addRiskScore(sourceIP, 10);
  }
  // TODO: Add additional tests for cases of >10 unique ports or >10 unique hosts
}
