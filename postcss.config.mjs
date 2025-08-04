import autoprefixer from "autoprefixer"
// import rtlcss from 'postcss-rtlcss' ← descomenta esto si necesitas soporte RTL

export default {
  plugins: [
    autoprefixer({
      overrideBrowserslist: [
        "last 4 Chrome versions",
        "last 4 Firefox versions",
        "last 4 Edge versions",
        "last 4 Safari versions",
        "last 4 Android versions",
        "last 4 ChromeAndroid versions",
        "last 4 FirefoxAndroid versions",
        "last 4 iOS versions",
      ],
    }),
    // rtlcss() ← descomenta esta línea para habilitar RTL si lo instalas
  ],
}
