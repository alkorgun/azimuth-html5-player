/**
 * Azimuth-player electron core script
 * index.js
 *
 * @author: alkorgun
 */
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const stateKeeper = require("electron-window-state");

const {app, BrowserWindow, ipcMain} = electron;

let win;

function createMainWindow() {
	let state = stateKeeper({defaultWidth: 960, defaultHeight: 768});

	win = new BrowserWindow({
		icon: path.join(__dirname, "assets/tbdd.png"),
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
		webPreferences: { additionalArguments: getArgs() }
	});

	state.manage(win);

	win.loadURL("file://{fld}/ssldocs/index.html".format({fld: __dirname}));

	enableDevTools(win);

	win.on("closed", () => {
		win = null;
	});
}

function enableDevTools(win) {
	if (process.argv.indexOf("--devtools") > -1) {
		win.webContents.openDevTools();
	}
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (win === null) {
		createMainWindow();
	}
});

const webview = "<webview style=\"height: 100%\" src=\"file://{filename}\" plugins></webview>";

ipcMain.on("open", (event, filename, clear) => {
	let tmp = new BrowserWindow({width: 960, height: 768});

	tmp.loadURL("data:text/html;base64," + b64encode(webview.format({filename: filename})));

	if (clear) {
		tmp.on("closed", () => {
			if (fs.existsSync(filename)) {
				fs.unlinkSync(filename);
			}
		});
	}
});

function getArgs() {
	let argv = process.argv,
		args = [];

	if (argv.length > 1) {
		args.push(argv[argv.length - 1]);
	}
	return args
}

function b64encode(str) {
	return Buffer.from(str).toString("base64");
}

String.prototype.format = function (desc) {
	return this.replace(/\{(.*?)\}/g, (function (data, key) { return desc[key] || ""; }));
};
