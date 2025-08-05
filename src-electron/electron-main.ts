// electron-main.ts (o electron-main.js si usas ESM)
// -----------------------------------------------

import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

/**
 * electron-updater es CommonJS. Hay que importarlo como default
 * y después extraer autoUpdater.
 */
import updaterPkg from 'electron-updater'
const { autoUpdater } = updaterPkg

import log from 'electron-log'

// 1. Forzar ruta de log a <userData>/logs/main.log
log.transports.file.resolvePath = () =>
  path.join(app.getPath('userData'), 'logs', 'main.log')
log.transports.file.level = 'debug'
autoUpdater.logger = log

// 2. Mensaje de inicio para confirmar que el logger funciona
log.info('🚀 Iniciando la app', {
  userDataPath: app.getPath('userData')
})

// Rutas dinámicas
const preloadFolder =
  process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? 'dist/electron'
const preloadExtension =
  process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? '.js'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const platform = process.platform || os.platform()
const preloadPath = path.resolve(
  __dirname,
  path.join(preloadFolder, `electron-preload${preloadExtension}`)
)
const appUrl = process.env.APP_URL

let mainWindow: BrowserWindow | undefined

async function createWindow() {
  log.info('📦 createWindow()')

  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'),
    width: 1000,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath
    }
  })

  if (appUrl) {
    await mainWindow.loadURL(appUrl)
    log.info('🌐 Cargando dev server:', appUrl)
  } else {
    await mainWindow.loadFile(path.resolve(__dirname, 'index.html'))
    log.info('🗄️ Cargando archivo empaquetado')
    autoUpdater.checkForUpdatesAndNotify()
  }

  if (process.env.DEBUGGING === 'true') {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined
    log.info('❌ mainWindow cerrada')
  })
}

// 3. Listeners de autoUpdater para forzar escritura de log
autoUpdater.on('checking-for-update', () => {
  log.info('🔍 checking-for-update')
})
autoUpdater.on('update-available', info => {
  log.info('✅ update-available', info)
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización disponible',
    message: 'Hay una nueva versión de la app. Se descargará en segundo plano.',
    buttons: ['Aceptar']
  })
})
autoUpdater.on('update-not-available', () => {
  log.info('🚫 update-not-available')
})
autoUpdater.on('error', err => {
  log.error('❌ autoUpdater error:', err)
  dialog.showErrorBox(
    'Error al buscar actualizaciones',
    err == null ? 'Error desconocido' : err.message || err.toString()
  )
})
autoUpdater.on('update-downloaded', info => {
  log.info('📥 update-downloaded', info)
  dialog
    .showMessageBox({
      type: 'question',
      title: 'Reiniciar para actualizar',
      message: 'La actualización está lista. ¿Deseas reiniciar ahora?',
      buttons: ['Reiniciar', 'Más tarde']
    })
    .then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

// 4. Ciclo de vida de la app
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    void createWindow()
  }
})