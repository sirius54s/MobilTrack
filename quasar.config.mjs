import { configure } from "quasar/wrappers"
import path from "path"

export default configure(() => {
  return {
    // Configuración de prefetch
    preFetch: true,

    // Boot files
    boot: ["axios"],

    // CSS global
    css: ["app.sass"],

    // Iconos y extras
    extras: ["material-icons"],

    // Configuración de build
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node20",
      },
      vueRouterMode: "history",
      analyze: true,
      minify: true,
      extendViteConf(viteConf) {
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          src: path.resolve(process.cwd(), "src"),
        }
      },
    },

    // Servidor de desarrollo
    devServer: {
      open: false,
      port: 9000,
    },

    // Framework de Quasar
    framework: {
      config: {
        notify: {
          position: "top",
          timeout: 2500,
          textColor: "white",
        },
      },
      plugins: ["Notify", "Dialog", "Loading", "LoadingBar"],
    },

    // Animaciones
    animations: "all",

    // SSR (si lo necesitas)
    ssr: {
      pwa: false, // Normalmente no se usa PWA con SSR
      prodPort: 3000,
      middlewares: ["render"],
    },

    // PWA (si lo necesitas)
    pwa: {
      workboxMode: "generateSW",
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      extendGenerateSWOptions(cfg) {
        // Configuración adicional del service worker
      },
      extendInjectManifestOptions(cfg) {
        // Configuración adicional del manifest
      },
      extendManifestJson(json) {
        json.name = "MobilTrack"
        json.short_name = "MobilTrack"
        json.description = "descripcion por redactar"
        json.display = "standalone"
        json.orientation = "portrait"
        json.background_color = "#ffffff"
        json.theme_color = "#027be3"
      },
    },

    // Cordova (móvil)
    cordova: {
      // Configuración para Cordova si la necesitas
    },

    // Capacitor (móvil)
    capacitor: {
      hideSplashscreen: true,
    },

    // Electron (aplicación de escritorio)
    electron: {
      inspectPort: 5858,

      // IMPORTANTE: Usar 'builder' para generar instaladores
      bundler: "builder",

      // Usar el builder interno de Quasar
      builder: {
        appId: "com.MobilTrack",
        productName: "MobilTrack",

        directories: {
          output: "dist_electron",
        },

        // DESHABILITAR FIRMA DE CÓDIGO
        forceCodeSigning: false,

        files: [
          "**/*",
          "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
          "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
          "!**/node_modules/*.d.ts",
          "!**/node_modules/.bin",
          "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
          "!.editorconfig",
          "!**/._*",
          "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
          "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
          "!**/{appveyor.yml,.travis.yml,circle.yml}",
          "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}",
        ],

        // Windows - Instalador NSIS
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64"],
            },
          ],
          verifyUpdateCodeSignature: false,
          signAndEditExecutable: false,
          forceCodeSigning: false,
        },

        // Configuración específica del instalador NSIS
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "siriusAdmin",
          uninstallDisplayName: "siriusAdmin",
          deleteAppDataOnUninstall: false,
          runAfterFinish: true,
          allowElevation: true,
          displayLanguageSelector: true,
          multiLanguageInstaller: false,
          packElevateHelper: true,
        },

        // macOS - DMG
        mac: {
          target: [
            {
              target: "dmg",
              arch: ["x64", "arm64"],
            },
          ],
          category: "public.app-category.productivity",
        },

        // Configuración del DMG
        dmg: {
          title: "siriusAdmin",
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications",
            },
            {
              x: 130,
              y: 150,
              type: "file",
            },
          ],
        },

        // Linux - AppImage y DEB
        linux: {
          target: [
            {
              target: "AppImage",
              arch: ["x64"],
            },
            {
              target: "deb",
              arch: ["x64"],
            },
          ],
          category: "Utility",
          synopsis: "siriusAdmin - Aplicación de administración",
          description:
            "Aplicación de administración desarrollada con Quasar y Electron",
        },

        // Configuración para actualizaciones automáticas (opcional)
        publish: {
          provider: "github",
          owner: "sirius54s", // 👈 reemplaza con tu usuario
          repo: "MobilTrack", // 👈 reemplaza con tu repositorio
        },
      },

      // Configuración del packager (no necesario con builder)
      packager: {},
    },

    // Browser Extension (si lo necesitas)
    bex: {
      contentScripts: ["my-content-script"],
    },
  }
})
