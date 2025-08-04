import { app, BrowserWindow, dialog } from "electron"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"

import electronUpdater from "electron-updater"
const { autoUpdater } = electronUpdater

import log from "electron-log"
import { updateElectronApp } from "update-electron-app"

// Configuración de logging para el auto-updater
autoUpdater.logger = log
log.transports.file.level = "debug"

// Chequeos automáticos cada 10 minutos y diálogos nativos
//

// Paths y directorios dinámicos
const preloadFolder =
  process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? "dist/electron"
const preloadExtension = process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? ".js"
const currentDir = fileURLToPath(new URL(".", import.meta.url))
const platform = process.platform || os.platform()
const preloadPath = path.resolve(
  currentDir,
  path.join(preloadFolder, `electron-preload${preloadExtension}`),
)

// URL de la app (dev vs prod)
const appUrl = process.env.APP_URL

let mainWindow: BrowserWindow | undefined

async function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, "icons/icon.png"),
    width: 1000,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
    },
  })

  if (appUrl) {
    // Modo desarrollo: carga Vite dev server
    await mainWindow.loadURL(appUrl)
  } else {
    // Modo producción: carga archivo empaquetado y chequea actualizaciones

    await mainWindow.loadFile(path.resolve(currentDir, "index.html"))
    updateElectronApp()
    autoUpdater.checkForUpdatesAndNotify()
  }

  // DevTools sólo si se activa DEBUGGING
  if (process.env.DEBUGGING === "true") {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.on("closed", () => {
    mainWindow = undefined
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (!mainWindow) {
    void createWindow()
  }
})

// Eventos del auto-updater

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización disponible",
    message: "Hay una nueva versión de la app. Se descargará en segundo plano.",
    buttons: ["Aceptar"],
  })
})

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "question",
      title: "Reiniciar para actualizar",
      message: "La actualización está lista. ¿Deseas reiniciar ahora?",
      buttons: ["Reiniciar", "Más tarde"],
    })
    .then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

autoUpdater.on("error", (error) => {
  dialog.showErrorBox(
    "Error al buscar actualizaciones",
    error == null ? "Error desconocido" : error.message || error.toString(),
  )
})
