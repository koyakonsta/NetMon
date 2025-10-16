# CSC1049 Project Proposal Form

## Section A
Project Name: Network Monitor                                                \
Student 1 Name: Regaus, ID Number ***REMOVED***                             \
Student 2 Name: koyakonsta O'Donnell-Dragovic, ID Number ***REMOVED***            \


## Project Description
### 1. Description
The Network Monitor project is an Android application designed to provide users with knowledge about the devices connected to their local network.
It continuously scans the network to identify all connected devices and shows important details, such as IP address, MAC address, and device type.
The main purpose of the project is to make it easy to detect unrecognised devices on the network and be alerted to suspicious activity.

The primary purpose of this application is to improve the security of users' wireless networks.
Network Monitor automatically identifies and classifies connected devices, allowing users to verify if each device is trusted.
It also notifies users when new, unrecognised devices join the network, thereby letting the user know of unauthorised network access.

The application works by periodically scanning the local network using standard networking techniques such as ARP requests, ICMP pings, and vendor lookups to identify active devices.
It compares these results with previously recorded data to detect changes, including new devices or modifications to existing ones.
Additionally, the app employs network monitoring mechanisms to identify attacks like ARP spoofing or cache poisoning, which can indicate that an attacker is 
trying to intercept or manipulate network traffic.
When such activities are detected, the app alerts the user push notifications in real time, allowing for quick response.

By combining continuous network scanning, device recognition, and attach detection into a single application, Network Monitor aims to be a comprehensive network security tool.
It can be used both by everyday users wishing for peace of mind and advanced users seeking deeper insights into their network environment.
Overall, the project will help to improve cybersecurity awareness and help users protect their data and privacy in an increasingly connected world.

### 2. Division of Work

| Task                                             | Members    |
|--------------------------------------------------|------------|
| UI Layout and UX                                 | Regaus      |
| Listing connected devices                        | Regaus      |
| Sending notifications about unrecognised devices | Regaus      |
| Storing data about the trusted devices           | Both       |
| Network scanning                                 | koyakonsta |
| MAC device type identifier                       | koyakonsta |
| ARP poisoning detector                           | koyakonsta |
| Making sample LAN for demonstration              | koyakonsta |
| Testing the app                                  | Both       |


### 3. Programming Languages
- Python - For most of the application development, using Chaquopy
- Java - In case any features are not available in Python or Chaquopy
- JSON - for the trusted devices (user-provided device name, device type, IP, MAC)

Java, Python

### 4. Programming Tools
 - Android Studio 
 - JetBrains DE (including JetBrains collaborative live editing + GitLab) 
 - Chaquopy for Python-on-Android 

### 5. Learning Challenges
We expect a moderate learning curve during the course of this project's implementation, as we do not have any experience developing Android applications 
or interacting with the development ecosystem of the OS. We also have little experience in low-level networking and using networking tools such as 
network sniffers and packet spoofing libraries, which will be among the central components in the project's structure.

### 6. Hardware/Software Platform
Android

### 7. Special requirements
- Possible need for elevated Android system features (i.e. Root Access)