// main.js

// Modules to control application life and create native browser window
const path = require("path");
const WebSocket = require("ws");
const ModbusRTU = require("modbus-serial");
const { app, BrowserWindow } = require("electron");

// Define the modbus address and port
const MODBUS_ADDRESS = "192.168.1.1";
const MODBUS_PORT = 502;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Connect to the modbus device
  const client = new ModbusRTU();
  client.connectTCP(MODBUS_ADDRESS, { port: MODBUS_PORT });

  const wss = new WebSocket.Server({ port: 3000 });

  // Listen for WebSocket connections
  wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    // Listen for messages from the renderer process
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "data") {
          // Read the modbus data and send it to the renderer process
          client.readInputRegisters(0, 6, (err, data) => {
            if (err) {
              console.error(err);
            } else {
              ws.send(JSON.stringify(data.data));
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  });

  // Close the modbus connection on exit
  process.on("exit", () => {
    client.close();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
