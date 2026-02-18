# Network Monitor: User Manual

Authors: Regaus (***REMOVED***) and koyakonsta (***REMOVED***)

## Table of Contents
1. [Overview](#1-overview)<br>
   1.1 [Accessing the App](#11-accessing-the-app)
2. [Scanning the Network](#2-scanning-the-network)
3. [Threat Detection](#3-threat-detection)

## 1. Overview
The purpose of this user manual is to help an application user navigate and understand the features of the Network Monitor app.
The app is used to detect any suspicious activity on the current network, so that people can make sure that the network they're connected to is safe.

This manual will go over the major features of Network Monitor, such as detecting the devices connected to the network and threat detection.

### 1.1 Accessing the App
To open Network Monitor, you can install the application from an APK file.
If you have the source code, you can also open a terminal in the `code` directory and run `npm install` and `ns run android`.

Upon opening, you are greeted with the home screen that shows the list of devices connected to your network.
The network and packet scanners should start automatically upon opening the application, but a button will appear if it didn't work for any reason.

It is also possible to rerun the network scan at any time using the "Scan Network" button visible on screen.

## 2. Scanning the Network
Network Monitor scans the list of devices connected to the network upon opening the app.
For each connected device, the user can see its address(es), and where available, the device manufacturer.

Each device has an associated risk score, which starts at zero, and increments when any suspicious activity is detected being done by the device.
Upon reaching a threshold, the device gets automatically flagged as suspicious. There is also a button to manually mark a device as safe or unsafe.

## 3. Threat Detection
Network activity is automatically monitored in background.
The actual contents of internet traffic are not analysed, but other parameters are used to detect anything unusual.

If a device connects to multiple hosts or multiple ports in a very short span of time, the application will show an alert about this to the user.
This means that the device is performing a "port scan" or a "network scan". It may not necessarily be malicious, but it is worth to take note and decide whether the device is safe or compromised.

Similarly, the app will alert the user if it detects suspicious ARP requests and/or responses coming from a device.
This indicates an "ARP spoofing" or "ARP poisoning" attack, and is usually done for man-in-the-middle attacks where a device pretends to be the router to interfere with the network's traffic.