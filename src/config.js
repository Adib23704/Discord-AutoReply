import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import process from 'process';

const configPath = path.join(app.getPath('userData'), 'config.json');

const defaultIconPath = path.join(process.cwd(), 'assets/icon.ico');

let configWindowState;
let config;

function loadConfig() {
	if (fs.existsSync(configPath)) {
		const configFile = fs.readFileSync(configPath);
		return JSON.parse(configFile);
	}
	return {
		msg: null,
		token: null
	};
}

function saveConfig(config) {
	fs.writeFileSync(configPath, JSON.stringify(config));
}

function configWindow() {
	if (configWindowState) {
		configWindowState.focus();
		return;
	}

	configWindowState = new BrowserWindow({
		width: 400,
		height: 380,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		title: 'Discord AutoReply Config',
		icon: defaultIconPath,
		autoHideMenuBar: true,
		center: true,
		fullscreenable: false,
		movable: true
	});

	configWindowState.loadFile('html/config.html');

	configWindowState.on('closed', () => {
		configWindowState = null;
	});

	configWindowState.webContents.on('did-finish-load', () => {
		configWindowState.webContents.send('config-data', config);
	});
}

export { configWindow, loadConfig, saveConfig };