# Network Monitor: Technical Specification

Authors: Regaus (***REMOVED***) and koyakonsta (***REMOVED***)

## Table of Contents
1. [Introduction](#1-introduction)<br>
   1.1 [Overview](#11-overview)<br>
   1.2 [Glossary](#12-glossary)
2. [System Features and Requirements](#2-system-features-and-requirements)<br>
   2.1 [Device Discovery](#21-device-discovery)<br>
   2.2 [Device Identification and Classification](#22-device-identification-and-classification)<br>
   2.3 [ARP Spoofing Detection](#23-arp-spoofing-detection)<br>
   2.4 [Network Scan Detection](#24-network-scan-detection)<br>
   2.5 [Threat Event Alerts](#25-threat-event-alerts)<br>
   2.6 [Threat Event Logging](#26-threat-event-logging)<br>
   2.7 [Manual Device Management](#27-manual-device-management)<br>
   2.8 [Local Storage](#28-local-storage)<br>
   2.9 [Data Synchronisation](#29-data-synchronisation)<br>
   2.10 [User Interface and Dashboard](#210-user-interface-and-dashboard)<br>
   2.11 [Background Monitoring](#211-background-monitoring)<br>
   2.12 [Import/Export Device Lists](#212-importexport-device-lists)<br>
   2.13 [Settings and Configuration](#213-settings-and-configuration)<br>
3. [System Architecture](#3-system-architecture)
4. [High-Level Design](#4-high-level-design)
5. [Problems and Resolutions](#5-problems-and-resolutions)
6. [Installation Guide](#6-installation-guide)

## 1. Introduction
### 1.1 Overview
This technical specification outlines the functionalities, requirements, and design for Network Monitor, an Android application that allows the user to ensure that their current network is safe.
This app monitors network activity in the background to check for any potentially malicious activity.

### 1.2 Glossary
Below is the explanation for terms used in this technical specification which may not be obvious:

- ARP - Address Resolution Protocol - A protocol for devices to match physical MAC addresses to logical IP addresses.
- TCP - Transmission Control Protocol - A protocol that ensures reliable delivery of data packets between applications on the IP network.
- ICMP - Internet Control Message Protocol - A protocol used by routers and hosts to communicate network feedback and operational status.
- ARP spoofing or ARP poisoning - A network attack where a device sends a malicious ARP reply and pretends to be a different device. This is usually done to intercept, modify, or disrupt network
  traffic on the local network.
- Network Scan - A technique to identify active devices (hosts) and open ports on the network to map its structure or identify potential vulnerabilities.
- Port Scan - A technique that sends client requests to a range of server port addresses to determine which ones are open, closed, or filtered.
- Ping Sweep - A technique to identify active hosts within a specific range of IP addresses.

## 2. System Features and Requirements
Below are the system requirements as they were defined in the functional spec.
Where applicable, these include a more detailed explanation of the implementation or reasons why it was not implemented.

### 2.1 Device Discovery
The application scans the local network to identify active connected devices.
This is achieved using the `nmap` shell utility. The command uses the following to check if hosts are alive:

- ARP request ping
- TCP SYN probe to port 443
- TCP ACK probe to port 80
- ICMP Echo request
- ICMP Timestamp request

The command scans the entire subnet range of IPs performing the above requests.
The output is then shown on the home page, with each device's hostname, address(es), and vendor.

### 2.2 Device Identification and Classification
The application determines each device's manufacturer using vendor lookups. This is achieved using the `mac-oui-lookup` JavaScript library.

The application does not attempt to classify the device type using the information about the manufacturer.

### 2.3 ARP Spoofing Detection
The application detects anomalies in the ARP activity for any changes which may indicate spoofing or cache poisoning.

This and the feature below are both implemented using `tcpdump` to analyse any network packets that the device receives.
The packets are parsed by the application to detect any unusual signals which may indicate malicious behaviour.

If the application receives an ARP reply where a device maps itself to an IP address that was already occupied in the ARP table, this indicates an ARP spoofing attack.
As such, the application flags such behaviour and alerts the user.

### 2.4 Network Scan Detection
The application detects when another device is scanning ports or hosts by analysing traffic patterns.

This is done by analysing IP packets and seeing how many unique hosts and ports were connected to in a short span of time.
The application temporarily stores information about TCP SYN packets and runs the following checks every 10 seconds for each device:

- 40+ SYN packets sent in 10s (network scan or ping sweep)
- 10+ ports connected to in 10s (port scan)
- 10+ hosts connected to in 10s (ping sweep)

If any of these conditions are detected, the application flags the behaviour and alerts the user.

### 2.5 Threat Event Alerts
Whenever a threat is detected as described in the two sections above, Network Monitor sends a notification to the user.
The notification states the type of threat and a brief description of what was detected.

Each threat notification has two buttons:

- "Mark Unsafe" - Marks the device behaving suspiciously as unsafe
- "Dismiss" - Do nothing

Note: Devices that had a possible threat detected will be marked as "potentially unsafe", even if the user doesn't manually mark them as unsafe.

### 2.6 Threat Event Logging
All detected threats are also logged to a file in the app's local storage.
This means that the log file persists between sessions, unless the user manually clears it.

Each threat event contains the summary that was shown in the notification, but also adds some further detail:

- For network scans, this includes the list of hosts and ports that the device connected to
- For ARP spoofing, this states the MAC address found in the ARP table for the provided IP address and the MAC address used by the device.

The user is able to clear the log at any time, which deletes all the threat logs.

### 2.7 Manual Device Management
The application allows the user to manually mark a device as safe or unsafe.
This is achieved using a button in the device list.

### 2.8 Local Storage
The application stores the threat logs in a local file which is persistent between sessions.

However, the device list is not stored and is reloaded upon application restart.

### 2.9 Data Synchronisation
The application should have been able to synchronise device data, labels, and alerts with other devices using a local backend.
However, this was not implemented as we didn't have enough time.

### 2.10 User Interface and Dashboard
The application presents a clear interface that shows active devices and network status.
There is a simple chart that shows whether the proportion of suspicious devices on the network.

### 2.11 Background Monitoring
The application runs scans and checks in the background.
This is achieved by having a `tcpdump` process analyse network traffic. The traffic is then analysed by the app to detect any unusual activity.

If the `nmap` and `tcpdump` workers failed to start up, a button is shown to the user which lets them manually launch the process.

### 2.12 Import/Export Device Lists
The application should have been able to allow the user to import and export the device records for backup purposes.
However, since the device list is not stored, this was not implemented.

### 2.13 Settings and Configuration
The application should have been able to allow the user to configure scan frequency and alert thresholds.
However, this was not implemented and the application uses reasonable defaults instead.

## 3. System Architecture
...

## 4. High-Level Design
...

## 5. Problems and Resolutions
...

## 6. Installation Guide
...