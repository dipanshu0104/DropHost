
# DropHost 

Your self hosted file uploading server (NAS).

![alt text](public/images/Capture.PNG)

#### live demo 

- [DropHost-live](https://drophost-rbhb.onrender.com)

# What is DropHost? 

The DropHost server is basically used to create a self file hosted file uploading server or NAS ( Network attached storage ). Which is use to upload a file on a server computer and also manage these files with the help of a impressive web UI.

## Features

 - Easy to setup.
 - User friendly interface.
 - Authentication security.
 - Connect multiple devices.
 - Send the data to your server securely.

## Testing 

This tool is tested on :

- Windows
- Linux
- MacOs
- Docker
- raspberry pi
- Termux

## Authors

- [dipanshu0104](https://github.com/dipanshu0104)


# Installation and requirments

- This tool require NodeJS and MongoDB.

## Installation

- Step 1. Clone the code by git clone. 

```bash  
git clone https://github.com/dipanshu0104/DropHost.git 
```
( You can also download the zip file directly. )

- Step 2. First download the required nodejs packages by these commands to go at the drophost folder path, And run these commands.

```bash  
npm install 
```

- Step 3. Now run the install-setup.js file for setup service of the app using the following command.

```bash  
node ./install-setup.js
```
This file setup a service in windows for the DropHost app so everyone can run the app on startup of the operating system.

-Step 4. Now it is running on the port 3000 so you can access it with the browser using ip address or port no.

```bash  
http://<ipaddress>:3000
```

### Handle in windows

This tool create a service do you can just handle it by its service which name is DropHost placed in service section.

### Handle in linux

This tool also create a service for linux which is handle by the system control service so we can handle it by them.

```bash  
# command
sudo systemctl <option> drophost
# follow this command you can start, stop, restart, reload, enable, disable etc. like
sudo systemctl start drophost
sudo systemctl stop drophost
```

### I hope you will use this Node.js  app very efficiently.
