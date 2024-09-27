const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

function detectOS() {
    const platform = os.platform();
    
    if (platform === 'win32') {
        const { Service } = require('node-windows');
        
        const serviceName = 'DropHost';
        const svc = new Service({
            name: serviceName,
            description: 'Your self hosted file uploading server (NAS).',
            script: path.join(__dirname, 'app.js').replace(/\\/g, '\\\\')
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const installService = () => {
            console.log('Installing npm packages...');
            execSync('npm install', { stdio: 'inherit' });

            svc.on('install', () => {
                console.log(`${serviceName} installed successfully`);
                svc.start();
            });

            console.log('Installing the service...');
            svc.install();
        };

        const uninstallService = () => {
            svc.on('uninstall', () => {
                console.log(`${serviceName} uninstalled successfully`);
                if (fs.existsSync('node_modules')) {
                    fs.rmSync('node_modules', { recursive: true, force: true });
                    console.log('node_modules folder removed');
                }
            });

            console.log('Uninstalling the service...');
            svc.uninstall();
        };

        rl.question('Install or uninstall the service? (I/U): ', (answer) => {
            answer.toLowerCase() === 'i' ? installService() : answer.toLowerCase() === 'u' ? uninstallService() : console.log('Invalid input');
            rl.close();
        });


    } else if (platform === 'linux') {

        const serviceName = 'drophost';
        const serviceFilePath = `/etc/systemd/system/${serviceName}.service`;
        const nodeAppPath = path.join(__dirname, 'app.js');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const createServiceFile = (startCommand) => {
            const serviceFileContent = `
                        [Unit]
                        Description=Your self hosted file uploading server (NAS)
                        After=network.target

                        [Service]
                        ExecStart=${startCommand}
                        WorkingDirectory=${__dirname}
                        Restart=always
                        RestartSec=5
                        StartLimitBurst=5
                        StartLimitIntervalSec=33
                        Environment=NODE_ENV=production
                        Environment=PORT=3000
                        Environment=MONGODB_URI=mongodb://localhost:27017/DropHost

                        [Install]
                        WantedBy=multi-user.target `;
                
            fs.writeFileSync(serviceFilePath, serviceFileContent, { mode: 0o644 });
            console.log(`Service file created at ${serviceFilePath}`);
        };

        const installService = () => {
            const node_path = execSync(`which node`);
            const execStartCommand = String(node_path).trim() + " " + String(nodeAppPath).trim();
            createServiceFile(execStartCommand);
            execSync(`sudo systemctl daemon-reload`);
            execSync(`sudo systemctl enable ${serviceName}`);
            execSync(`sudo systemctl start ${serviceName}`);
            console.log(`${serviceName} service installed and started.`);
        };

        const uninstallService = () => {
            if (fs.existsSync(serviceFilePath)) {
                execSync(`sudo systemctl stop ${serviceName}`);
                execSync(`sudo systemctl disable ${serviceName}`);
                fs.unlinkSync(serviceFilePath);
                execSync('sudo systemctl daemon-reload');
                console.log(`${serviceName} service stopped and uninstalled.`);
            }
            // const nodeModulesPath = path.join(__dirname, 'node_modules');
            const folderPath = path.join(__dirname, 'node_modules');
            if (fs.existsSync('node_modules')) {

                fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error(`Error deleting folder: ${err.message}`);
                    } else {
                        console.log('node_modules Folder deleted successfully');
                    }
                });
            }
        };

        rl.question('Do you want to install or uninstall the service? (I/U): ', (answer) => {
            if (answer.toLowerCase() === 'i') {
                installService();
            } else if (answer.toLowerCase() === 'u') {
                uninstallService();
            } else {
                console.log('Invalid input. Please type "install" or "uninstall".');
            }
            rl.close();
        });



    } else {
        console.log(`Operating system is not recognized. Detected platform: ${platform}`);
    }
}

detectOS();