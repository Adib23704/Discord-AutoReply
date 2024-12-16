import { app, Menu, Tray, ipcMain } from 'electron';
import path from 'path';
import fetch from 'node-fetch';
import process from 'process';

import { aboutWindow } from './src/about.js';
import { configWindow, loadConfig, saveConfig } from './src/config.js';

const defaultIconPath = path.join(process.cwd(), 'assets/icon.ico');

const appVersion = app.getVersion();
const downloadUrl = 'https://github.com/Adib23704/Discord-AutoReply/releases/latest';

let tray;
let config;

function createContextMenu() {
	const currentContextMenu = [
		{ type: 'separator' },
		{
			label: 'Open Configuration',
			click: configWindow,
		},
		{
			label: 'About',
			click: aboutWindow,
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