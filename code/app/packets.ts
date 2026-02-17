import {storeSYNInfo} from "~/portscans";
import {globalState} from "~/store";

export interface packetHeader {
  timestampSeconds: number;
  timestampMicroseconds: number;
  capturedLength: number;
  originalLength: number;
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
      return;
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

export function addRiskScore(address: string, points: number) {
  let device;
  for (const currDevice of globalState.scanlist) {
    if (device) { break; }
    for (const currAddress of currDevice.address) {
      if (currAddress.addr == address) {
        device = currDevice;
        break;
      }
    }
  }

  if (device) {
    device.riskScore += points;
  }
}
