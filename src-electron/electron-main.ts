import { app, BrowserWindow, dialog, Menu, shell, ipcMain } from "electron"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"

// electron-updater es CommonJS, lo importamos como default y extraemos autoUpdater
import updaterPkg from "electron-updater"
const { autoUpdater } = updaterPkg

import log from "electron-log"

// 1. Configuración avanzada de logging
log.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs", "main.log")
log.transports.file.level = "debug"
log.transports.console.level = "info"
autoUpdater.logger = log

// 2. Configuración del auto-updater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

// 3. Variables globales
let mainWindow: BrowserWindow | undefined
let updateInfo: any = null
let isUpdateDownloaded = false

let hasAskedForDownload = false
let hasAskedForInstall = false

// 4. Rutas dinámicas
const __dirname = fileURLToPath(new URL(".", import.meta.url))
const preloadFolder =
  process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? "dist/electron"
const preloadExtension = process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? ".js"
const preloadPath = path.resolve(
  __dirname,
  path.join(preloadFolder, `electron-preload${preloadExtension}`),
)
const appUrl = process.env.APP_URL

// 5. Diálogo de actualización
async function showUpdateDialog(type: "available" | "downloaded", info?: any) {
  if (!mainWindow) return
  const buttons =
    type === "available"
      ? ["Descargar ahora", "Recordar más tarde", "Saltar esta versión"]
      : ["Reiniciar ahora", "Reiniciar al cerrar", "Más tarde"]

  const title =
    type === "available"
      ? "🚀 Nueva actualización disponible"
      : "✅ Actualización lista para instalar"

  const message =
    type === "available"
      ? `Se encontró una nueva versión ${info?.version || "disponible"}.\n\n` +
        `Versión actual: ${app.getVersion()}\n` +
        `Nueva versión: ${info?.version || "N/A"}\n\n` +
        `¿Deseas descargar la actualización ahora?`
      : `La actualización se ha descargado correctamente.\n\n` +
        `¿Deseas reiniciar la aplicación para aplicar los cambios?`

  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title,
    message,
    detail:
      type === "available"
        ? "La descarga se realizará en segundo plano y no interrumpirá tu trabajo."
        : "Los cambios se aplicarán después de reiniciar la aplicación.",
    buttons,
    defaultId: 0,
    cancelId: type === "available" ? 1 : 2,
    icon: path.resolve(__dirname, "icons/icon.png"),
  })

  return result.response
}

// 6. Crear ventana principal
async function createWindow() {
  log.info("📦 Creando ventana principal")

  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"),
    width: 1000,
    height: 700,
    resizable: false,
    autoHideMenuBar: false,
    useContentSize: false,
    titleBarStyle: "default",
    show: false,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false,
    },
  })

  mainWindow.once("ready-to-show", () => {
    log.info("🖼️ Ventana lista para mostrar")
    mainWindow?.show()

    // Solo si estás probando el updater en dev
    if (!app.isPackaged && process.env.DEBUGGING === "true") {
      ;(app as any).isPackaged = true
    }

    setTimeout(() => {
      log.info("🔍 Iniciando verificación de actualizaciones...")
      autoUpdater.checkForUpdatesAndNotify()
    }, 3000)
  })

  try {
    if (appUrl) {
      await mainWindow.loadURL(appUrl)
      log.info("🌐 Cargando dev server:", appUrl)
    } else {
      const filePath = path.resolve(__dirname, "index.html")
      await mainWindow.loadFile(filePath)
      log.info("🗄️ Cargando archivo empaquetado:", filePath)
    }
  } catch (err) {
    log.error("❌ Error al cargar contenido:", err)
    dialog.showErrorBox("Error al cargar la app", String(err))
  }

  if (process.env.DEBUGGING === "true") {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.on("closed", () => {
    mainWindow = undefined
    log.info("❌ Ventana principal cerrada")
  })
}

// 7. Listeners del auto-updater
autoUpdater.on("checking-for-update", () => {
  log.info("🔍 Verificando actualizaciones...")
})

autoUpdater.on("update-available", async (info) => {
  log.info("✅ Actualización disponible:", info)
  updateInfo = info

  if (!hasAskedForDownload) {
    hasAskedForDownload = true
    const choice = await showUpdateDialog("available", info)
    switch (choice) {
      case 0:
        log.info("📥 Iniciando descarga de actualización")
        autoUpdater.downloadUpdate()
        break
      case 1:
        log.info("⏰ Actualización pospuesta")
        setTimeout(
          () => {
            if (!isUpdateDownloaded) {
              autoUpdater.checkForUpdatesAndNotify()
            }
          },
          60 * 60 * 1000,
        )
        break
      case 2:
        log.info("⏭️ Versión omitida:", info.version)
        break
    }
  } else {
    log.info("🚫 Ya se mostró el diálogo de descarga para esta versión")
  }
})

autoUpdater.on("update-not-available", () => {
  log.info("✅ La aplicación está actualizada")
})

autoUpdater.on("error", (err) => {
  log.error("❌ Error en auto-updater:", err)
  if (mainWindow) {
    dialog.showErrorBox(
      "Error de actualización",
      "No se pudo verificar las actualizaciones.\n\n" +
        "Detalles: " +
        (err.message || err.toString()),
    )
  }
})

autoUpdater.on("download-progress", (progressInfo) => {
  const percent = Math.round(progressInfo.percent)
  log.info(`📥 Progreso de descarga: ${percent}%`)
  if (mainWindow) {
    mainWindow.setTitle(`MobilTrack - Descargando ${percent}%`)
  }
})

autoUpdater.on("update-downloaded", async (info) => {
  log.info("📥 Actualización descargada:", info)
  isUpdateDownloaded = true

  if (!hasAskedForInstall) {
    hasAskedForInstall = true
    const choice = await showUpdateDialog("downloaded", info)
    switch (choice) {
      case 0:
        log.info("🔄 Reiniciando para aplicar actualización")
        autoUpdater.quitAndInstall(false, true)
        break
      case 1:
        log.info("🔄 Actualización programada para el próximo reinicio")
        autoUpdater.autoInstallOnAppQuit = true
        break
      case 2:
        log.info("⏰ Instalación pospuesta")
        break
    }
  } else {
    log.info("🚫 Ya se mostró el diálogo de instalación para esta descarga")
  }
})

// 8. Inicialización
app.on("ready", createWindow)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
