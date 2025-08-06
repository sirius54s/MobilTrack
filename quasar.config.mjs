// quasar.config.mjs
import { configure } from "quasar/wrappers"
import { fileURLToPath, URL } from "node:url"

export default configure(() => ({
  // Archivos de arranque
  boot: ["axios"],

  // Estilos globales
  css: ["app.sass"],

  // Iconos y extras
  extras: ["material-icons"],

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
        // Alias de src usando fileURLToPath para ESMM
        src: fileURLToPath(new URL("./src", import.meta.url)),
      }
    },
  },

  devServer: {
    open: false,
    port: 9000,
  },

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

  animations: "all",

  // Capacitor (móvil)
  capacitor: {
    hideSplashscreen: true,
  },

  electron: {
    inspectPort: 5858,
    bundler: "builder",

    builder: {
      appId: "com.MobilTrack",
      productName: "MobilTrack",

      directories: {
        output: "dist_electron",
      },

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

      win: {
        target: [{ target: "nsis", arch: ["x64"] }],
        verifyUpdateCodeSignature: false,
        signAndEditExecutable: false,
        forceCodeSigning: false,
      },

      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "MobilTrack",
        uninstallDisplayName: "MobilTrack",
        deleteAppDataOnUninstall: false,
        runAfterFinish: true,
        allowElevation: true,
        displayLanguageSelector: true,
        multiLanguageInstaller: false,
        packElevateHelper: true,
      },

      mac: {
        target: [{ target: "dmg", arch: ["x64", "arm64"] }],
        category: "public.app-category.productivity",
      },

      dmg: {
        title: "MobilTrack",
        contents: [
          { x: 410, y: 150, type: "link", path: "/Applications" },
          { x: 130, y: 150, type: "file" },
        ],
      },

      linux: {
        target: [
          { target: "AppImage", arch: ["x64"] },
          { target: "deb", arch: ["x64"] },
        ],
        category: "Utility",
        synopsis: "MobilTrack - Aplicación de rastreo",
        description: "Aplicación de rastreo desarrollada con Quasar y Electron",
      },

      publish: [
        {
          provider: "github",
          owner: "sirius54s",
          repo: "MobilTrack",
        },
      ],
    },
  },

  // Browser Extension (si lo necesitas)
  // bex: {
  //   contentScripts: ['my-content-script'],
  // },
}))
