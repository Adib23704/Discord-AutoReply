import { app, BrowserWindow } from 'electron';
import path from 'path';
import process from 'process';

const defaultIconPath = path.join(process.cwd(), 'assets/icon.ico');
let aboutWindowState;

const appVersion = app.getVersion();

function aboutWindow() {
	if (aboutWindowState) {
		aboutWindowState.focus();
		return;
	}

	aboutWindowState = new BrowserWindow({
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

	aboutWindowState.loadFile('html/about.html');

	aboutWindowState.on('closed', () => {
		aboutWindowState = null;
	});

	aboutWindowState.webContents.on('did-finish-load', () => {
		aboutWindowState.webContents.send('about-data', appVersion);
	});
}

export { aboutWindow };