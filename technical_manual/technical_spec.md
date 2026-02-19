# Network Monitor: Technical Specification

Authors: Regaus (***REMOVED***) and koyakonsta (***REMOVED***)

## Table of Contents
...

## 1. Introduction
### 1.1 Overview
This technical specification outlines the functionalities, requirements, and design for Network Monitor, an Android application that allows the user to ensure that their current network is safe.
This app monitors network activity in the background to check for any potentially malicious activity.

### 1.2 Glossary
Below is the explanation for terms used in this technical specification which may not be obvious:
- .

## 2. System Features and Requirements
Below are the system requirements as they were defined in the functional spec.
Where applicable, these include a more detailed explanation of the implementation or reasons why it was not implemented.

### 2.1 Device Discovery
The application scans the local network to identify active connected devices.
This is achieved using the `nmap` shell utility. The command uses the following to check if hosts are alive:
- ARP request ping
- TCP SYN probe to port 443
- TCP ACK probe to port 80
- IMCP Echo request
- ICMP Timestamp request

The command scans the entire subnet range of IPs performing the above requests.
The output is then shown on the home page, with each device's hostname, address(es), and vendor.

### 2.2 Device Identification and Classification
The application determines each device's manufacturer using vendor lookups. This is achieved using the `mac-oui-lookup` JavaScript library.

<...>

### 2.3 ARP Spoofing Detection
The application detects anomalies in the ARP activity for any changes which may indicate spoofing or cache poisoning.

This and the feature below are both implemented using `tcpdump` to analyse any network packets that the device receives.
The packets are parsed by the application to detect any unusual signals which may indicate malicious behaviour.

### 2.4 Network Scan Detection
The application detects when another device is scanning ports or hosts by analysing traffic patterns.

This is done by analysing IP packets and seeing how many unique hosts and ports were connected to in a short span of time.
If too many connections are made to different hosts and ports, this indicates a port scan or network scan.

### 2.5 Threat Event Alerts
...

### 2.6 Threat Event Logging
...

### 2.7 Manual Device Management
The application allows the user to manually mark a device as safe or unsafe.
This is achieved using a button in the device list.

### 2.8 Local Storage
...

### 2.9 Data Synchronisation
The application should have been able to synchronise device data, labels, and alerts with other devices using a local backend.
However, this was not implemented as we didn't have enough time.

### 2.10 User Interface and Dashboard
The application presents a clear interface that shows active devices and network status.

### 2.11 Background Monitoring
The application runs scans and checks in the background.
This is achieved by having a `tcpdump` process analyse network traffic. The traffic is then analysed by the app to detect any unusual activity.

### 2.12 Import/Export Device Lists
...

### 2.13 Settings and Configuration
...

## 3. System Architecture
...

## 4. High-Level Design
...

## 5. Problems and Resolution
...

## 6. Installation Guide
...