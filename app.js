import { app, Menu, Tray, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPath = path.join(app.getPath('userData'), 'config.json');
const defaultIconPath = path.join(__dirname, 'assets/icon.ico');

const appVersion = app.getVersion();
const downloadUrl = 'https://github.com/Adib23704/Discord-AutoReply/releases/latest';

let tray;
let config;
let configWindow;
let aboutWindow;

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

function openConfigWindow() {
	if (configWindow) {
		configWindow.focus();
		return;
	}

	configWindow = new BrowserWindow({
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

	configWindow.loadFile('html/config.html');

	configWindow.on('closed', () => {
		configWindow = null;
	});

	configWindow.webContents.on('did-finish-load', () => {
		configWindow.webContents.send('config-data', config);
	});
}

function openAboutWindow() {
	if (aboutWindow) {
		aboutWindow.focus();
		return;
	}

	aboutWindow = new BrowserWindow({
		width: 400,
		height: 500,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		title: 'About Discord AutoReply',
		icon: defaultIconPath,
		autoHideMenuBar: true,
		center: true,
		fullscreenable: false,
		movable: true
	});

	aboutWindow.loadFile('html/about.html');

	aboutWindow.on('closed', () => {
		aboutWindow = null;
	});

	aboutWindow.webContents.on('did-finish-load', () => {
		aboutWindow.webContents.send('about-data', appVersion);
	});
}

function createContextMenu() {
	const currentContextMenu = [
		{ type: 'separator' },
		{
			label: 'Open Configuration',
			click: openConfigWindow,
		},
		{
			label: 'About',
			click: openAboutWindow,
		},
		{ label: 'Quit', role: 'quit' },
	];

	tray.setContextMenu(Menu.buildFromTemplate(currentContextMenu));
}

app.whenReady().then(() => {
	tray = new Tray(defaultIconPath);
	tray.setToolTip('Discord AutoReply');

	config = loadConfig();
	createContextMenu();

	ipcMain.on('save-config', (event, newConfig) => {
		config = newConfig;
		saveConfig(config);
	});

	ipcMain.on('check-for-update', async (event) => {
		try {
			const response = await fetch(
				'https://raw.githubusercontent.com/Adib23704/Discord-AutoReply/refs/heads/master/package.json'
			);
			const data = await response.json();
			const latestVersion = data.version;

			if (latestVersion !== appVersion) {
				event.sender.send('update-available', true, latestVersion, downloadUrl);
			} else {
				event.sender.send('update-available', false);
			}
		} catch (error) {
			console.error('Error checking for update:', error);
			event.sender.send('update-check-failed');
		}
	});

	app.on('window-all-closed', (event) => {
		event.preventDefault();
	});
});