import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  shell,
  ipcMain,
  Notification,
} from "electron"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"

/**
 * electron-updater es CommonJS. Hay que importarlo como default
 * y después extraer autoUpdater.
 */
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
autoUpdater.checkForUpdatesAndNotify()
autoUpdater.autoDownload = false // No descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true

// 3. Variables globales
let mainWindow: BrowserWindow | undefined
let updateInfo: any = null
let isUpdateDownloaded = false

// Rutas dinámicas
const preloadFolder =
  process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? "dist/electron"
const preloadExtension = process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? ".js"
const __dirname = fileURLToPath(new URL(".", import.meta.url))
const platform = process.platform || os.platform()
const preloadPath = path.resolve(
  __dirname,
  path.join(preloadFolder, `electron-preload${preloadExtension}`),
)
const appUrl = process.env.APP_URL

// 4. Función para mostrar notificaciones del sistema
function showUpdateNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body })
    notification.show()
  }
}

// 5. Función mejorada para mostrar diálogos de actualización
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

// 6. Función para crear la ventana principal
async function createWindow() {
  log.info("📦 Creando ventana principal")

  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    autoHideMenuBar: true,
    useContentSize: true,
    titleBarStyle: "default",
    show: false, // No mostrar hasta que esté listo
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false,
    },
  })

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show()

    // Verificar actualizaciones solo en producción
    if (!appUrl) {
      // Esperar un poco antes de verificar actualizaciones
      setTimeout(() => {
        log.info("🔍 Iniciando verificación de actualizaciones...")
        autoUpdater.checkForUpdatesAndNotify()
      }, 3000)
    }
  })

  // Cargar la aplicación
  if (appUrl) {
    await mainWindow.loadURL(appUrl)
    log.info("🌐 Cargando dev server:", appUrl)
  } else {
    await mainWindow.loadFile(path.resolve(__dirname, "index.html"))
    log.info("🗄️ Cargando archivo empaquetado")
  }

  // Configurar DevTools
  if (process.env.DEBUGGING === "true") {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.on("closed", () => {
    mainWindow = undefined
    log.info("❌ Ventana principal cerrada")
  })
}

// 7. Configurar menú de la aplicación con opción manual de actualización
function createApplicationMenu() {
  const template: any[] = [
    {
      label: "Aplicación",
      submenu: [
        {
          label: "Acerca de MobilTrack",
          click: () => {
            dialog.showMessageBox({
              type: "info",
              title: "Acerca de MobilTrack",
              message: `MobilTrack v${app.getVersion()}`,
              detail:
                "Sistema de seguimiento móvil desarrollado con Electron + Quasar",
            })
          },
        },
        { type: "separator" },
        {
          label: "Buscar actualizaciones...",
          click: () => {
            log.info("🔍 Verificación manual de actualizaciones")
            autoUpdater.checkForUpdatesAndNotify()

            showUpdateNotification(
              "Buscando actualizaciones",
              "Verificando si hay nuevas versiones disponibles...",
            )
          },
        },
        { type: "separator" },
        {
          label: "Reiniciar",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            app.relaunch()
            app.quit()
          },
        },
        {
          label: "Salir",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 8. Listeners mejorados del auto-updater
autoUpdater.on("checking-for-update", () => {
  log.info("🔍 Verificando actualizaciones...")
})

autoUpdater.on("update-available", async (info) => {
  log.info("✅ Actualización disponible:", info)
  updateInfo = info

  showUpdateNotification(
    "🚀 Nueva actualización disponible",
    `Versión ${info.version} está lista para descargar`,
  )

  const choice = await showUpdateDialog("available", info)

  switch (choice) {
    case 0: // Descargar ahora
      log.info("📥 Iniciando descarga de actualización")
      autoUpdater.downloadUpdate()
      showUpdateNotification(
        "📥 Descargando",
        "La actualización se está descargando...",
      )
      break
    case 1: // Recordar más tarde
      log.info("⏰ Actualización pospuesta")
      // Recordar en 1 hora
      setTimeout(
        () => {
          if (!isUpdateDownloaded) {
            autoUpdater.checkForUpdatesAndNotify()
          }
        },
        60 * 60 * 1000,
      )
      break
    case 2: // Saltar versión
      log.info("⏭️ Versión omitida:", info.version)
      break
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

  // Actualizar título de ventana con progreso
  if (mainWindow) {
    mainWindow.setTitle(`MobilTrack - Descargando actualización ${percent}%`)
  }
})

autoUpdater.on("update-downloaded", async (info) => {
  log.info("📥 Actualización descargada:", info)
  isUpdateDownloaded = true

  // Restaurar título original
  if (mainWindow) {
    mainWindow.setTitle("MobilTrack")
  }

  showUpdateNotification(
    "✅ Actualización lista",
    "La actualización se instalará al reiniciar la aplicación",
  )

  const choice = await showUpdateDialog("downloaded", info)

  switch (choice) {
    case 0: // Reiniciar ahora
      log.info("🔄 Reiniciando para aplicar actualización")
      autoUpdater.quitAndInstall(false, true)
      break
    case 1: // Reiniciar al cerrar
      log.info("🔄 Actualización programada para el próximo reinicio")
      autoUpdater.autoInstallOnAppQuit = true
      break
    case 2: // Más tarde
      log.info("⏰ Instalación pospuesta")
      break
  }
})

// 9. IPC handlers para comunicación con renderer
ipcMain.handle("get-app-version", () => {
  return app.getVersion()
})

ipcMain.handle("check-for-updates", () => {
  autoUpdater.checkForUpdatesAndNotify()
})

ipcMain.handle("install-update", () => {
  if (isUpdateDownloaded) {
    autoUpdater.quitAndInstall()
  }
})

// 10. Ciclo de vida de la aplicación
app.whenReady().then(() => {
  createApplicationMenu()
  createWindow()

  log.info("🚀 Aplicación iniciada", {
    version: app.getVersion(),
    platform: platform,
    userDataPath: app.getPath("userData"),
  })
})

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (!mainWindow) {
    createWindow()
  }
})

// 11. Manejar salida de la aplicación
app.on("before-quit", (event) => {
  if (isUpdateDownloaded && autoUpdater.autoInstallOnAppQuit) {
    log.info("🔄 Instalando actualización al salir...")
  }
})

// 12. Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  log.error("💥 Excepción no capturada:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  log.error("💥 Promise rechazada:", reason, promise)
})
