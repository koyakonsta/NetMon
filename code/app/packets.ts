import {storeSYNInfo} from "~/portscans";
import {globalState} from "~/store";
import {getVendor} from "~/netutils";

export interface packetHeader {
  timestampSeconds: number;
  timestampMicroseconds: number;
  capturedLength: number;
  originalLength: number;
}

function padMACAddr(mac:string) {
  return mac.split(':')
    .map(b => b ? b.padStart(2, '0').toLowerCase() : '00')
    .join(':');
}

export function getTimestamp(header: packetHeader): number {
  return header.timestampSeconds + header.timestampMicroseconds / 1000000;
}

function macToString(address: number[]): string {
  return address.map((value, _1, _2) => {
    return value.toString(16);
  }).join(":");
}

function ipToString(address: number[]): string {
  return address.map((value, _1, _2) => {
    return value.toString();
  }).join(".");
}

export function analysePacket(header: packetHeader, data: number[]): void {
  // The first 14 bytes are the ethernet header
  const destinationMac = macToString(data.slice(0, 6));
  const sourceMac = macToString(data.slice(6, 12));
  const etherType = (data[12] << 8) + data[13];
  switch (etherType) {
    case 0x0800:  // IPv4
      return analyseIPv4(header, data.slice(14));
    case 0x0806:  // ARP
      return analyseARP(header, data.slice(14));
    case 0x0835:  // Reverse ARP
      return;
    case 0x86DD:  // IPv6
      return;
  }
}

export function analyseIPv4(header: packetHeader, ipPacket: number[]): void {
  // The first 20 bytes are the ip header
  if (ipPacket.length < 20) {
    console.warn("IP packet with insufficient data received. Ignoring...");
    return;
  }
  // const packetLength = ipHeader[2] << 8 + ipHeader[3];
  const IHL = (ipPacket[0] & 0x0F) * 4; //length of IP header; start of TCP header
  const protocolID = ipPacket[9];
  const sourceIP = ipToString(ipPacket.slice(12, 16));
  const destinationIP = ipToString(ipPacket.slice(16, 20));
  switch (protocolID) {
    case 0x01:  // ICMP
      return;
    case 0x06:  // TCP
      return analyseTCP(header, sourceIP, destinationIP, ipPacket.slice(IHL));
    case 0x11:  // UDP
      return;
  }
}

export function analyseTCP(header: packetHeader, sourceIP: string, destinationIP: string, tcpPacket: number[]): void {
  // The first 20 bytes are the TCP header
  // The Data Offset is in the 12th byte of the TCP header
  // const tcpDataOffsetByte = tcpPacket[12];
  // const tcpHeaderLength = (tcpDataOffsetByte >> 4) * 4; //Length of TCP header; start of payload
  // const sourcePort = (tcpPacket[0] << 8) + tcpPacket[1];
  const destinationPort = (tcpPacket[2] << 8) + tcpPacket[3];
  const tcpFlags = tcpPacket[13];
  // const tcpPayload = tcpPacket.slice(20);
  if (tcpFlags & (1 << 1)) {  // SYN packet
    storeSYNInfo(header, sourceIP, destinationIP, destinationPort);
  }
}

let arpTable: any[];

export function analyseARP(header: packetHeader, packet: number[]){
  const HWType = (packet[0]<<8) + packet[1]
  const ProtocolType = (packet[2]<<8) + packet[3] //(we will assume it is IPv4)
  const HWLength = packet[4];
  const ProtocolLength = packet[5];
  const Operation = (packet[6]<<8) + packet[7];
  const sender_HWAddress = padMACAddr( macToString( packet.slice(8, 8+HWLength)).toLowerCase());
  const sender_ProtocolAddress = ipToString(packet.slice(8+HWLength, 8+HWLength+ProtocolLength));
  const target_HWAddress = macToString(packet.slice(8+HWLength+ProtocolLength, 8+2*HWLength+ProtocolLength));
  const target_ProtocolAddress = ipToString(packet.slice(8+2*HWLength+ProtocolLength, 8+2*HWLength+2*ProtocolLength));
  console.log(`received ARP Packet from ${sender_HWAddress}/${sender_ProtocolAddress} to ${target_HWAddress}/${target_ProtocolAddress}`);

  if (!globalState.scanlist.some(host => host.address.some(addr => addr.addr==sender_HWAddress))){ //if sender not in scanlist
    //add to scanlist
    globalState.scanlist.push({
      status:{state:'up'},
      address:[
        {addr: sender_HWAddress, addrtype:'mac'},
        {addr: sender_ProtocolAddress, addrtype:'ipv4'}
      ],
      vendor:getVendor(sender_HWAddress, 'None'),
      riskScore:0,
      isSafe:true
    });
  }


  if (ProtocolType==0x0800) { //if protocol is ipv4
    if (HWType==1) { //if ethernet
      if (Operation==2) {//we only check replies
        console.log('\tARP-Reply');
        let arpDev = arpTable?.find(entry => entry.ip==sender_ProtocolAddress)?.mac;
        if ((arpDev!=null)&&(arpDev!==sender_HWAddress)) {
          //if entry already exists in arp table but with different MAC-IP pair, flag
          console.warn("Device " + sender_HWAddress + " made potential ARP poisoning attempt");
          addRiskScore(sender_HWAddress, 10);

        }
      }
    }
  }
  // Monitor ARP Traffic: Capture ARP packets on the network.
  //   Track ARP Entries: Maintain a table of valid IP-MAC address mappings.
  //   Check for Duplicates: For each new ARP packet:
  //   Compare the source IP and MAC address.
  //   If the source IP is already in the table but with a different MAC address, flag it as a potential ARP poisoning attempt.
  //   Validate MAC Address: Ensure the MAC address in the ARP packet matches the expected MAC address for the source IP.
  //   Alert on Anomalies: If discrepancies are found, generate an alert.

}

function getARP(){
  const process = java.lang.Runtime.getRuntime().exec("su");
  const command = `cat /proc/net/arp`;
  const os = new java.io.DataOutputStream(process.getOutputStream());
  os.writeBytes(`${command}\nexit\n`); os.flush();

  const scanner = new java.util.Scanner(process.getInputStream(), "UTF-8").useDelimiter("\\A");
  const stdout = scanner.hasNext() ? scanner.next() : ""; scanner.close();

  const arpentries = [];
  for (let line of stdout.split('\n').slice(1)) {
    if (!line) continue;

    // Split by one or more whitespace characters
    const parts = line.split(/\s+/);

    if (parts.length >= 4) {
      arpentries.push({
        ip: parts[0],
        hwType: parts[1],
        flags: parts[2],
        mac: parts[3].toLowerCase(),
        mask: parts[4],
        device: parts[5]
      });
    }
  }
  arpTable = arpentries;
  // console.log(arpTable);
}
setInterval(getARP, 3000);

export function addRiskScore(address: string, points: number) {
  let device = globalState.scanlist.find(dev => dev.address.some(_ => _.addr==address));
  if (device!=null) {
    device.riskScore = (device.riskScore??0) + points;
  }
  // let device;
  // for (const currDevice of globalState.scanlist) {
  //   if (device) { break; }
  //   for (const currAddress of currDevice.address) {
  //     if (currAddress.addr == address) {
  //       device = currDevice;
  //       break;
  //     }
  //   }
  // }
  //
  // if (device) {
  //   device.riskScore += points;
  // }
}
