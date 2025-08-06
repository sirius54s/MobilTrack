#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Obtener la nueva versión del argumento
const newVersion = process.argv[2]

if (!newVersion) {
  console.error("❌ Error: No se proporcionó una versión")
  console.error("Uso: node update-version.js <version>")
  process.exit(1)
}

console.log(`🔄 Actualizando versión a: ${newVersion}`)

try {
  // Actualizar package.json
  const packageJsonPath = path.join(__dirname, "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

  const oldVersion = packageJson.version
  packageJson.version = newVersion

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")
  console.log(`✅ package.json actualizado: ${oldVersion} → ${newVersion}`)

  // Actualizar package-lock.json si existe
  const packageLockPath = path.join(__dirname, "package-lock.json")
  if (fs.existsSync(packageLockPath)) {
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, "utf8"))
    packageLock.version = newVersion

    // Actualizar la versión del paquete raíz si existe
    if (packageLock.packages && packageLock.packages[""]) {
      packageLock.packages[""].version = newVersion
    }

    fs.writeFileSync(
      packageLockPath,
      JSON.stringify(packageLock, null, 2) + "\n",
    )
    console.log(
      `✅ package-lock.json actualizado: ${oldVersion} → ${newVersion}`,
    )
  }

  // Opcional: Actualizar otros archivos que contengan versión
  const filesToUpdate = [
    {
      file: "src-electron/electron-main.js",
      pattern: /version:\s*['"][\d.]+['"]/g,
      replacement: `version: '${newVersion}'`,
    },
    {
      file: "src/boot/version.js",
      pattern: /export\s+const\s+version\s*=\s*['"][\d.]+['"]/g,
      replacement: `export const version = '${newVersion}'`,
    },
  ]

  filesToUpdate.forEach(({ file, pattern, replacement }) => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8")
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement)
        fs.writeFileSync(filePath, content)
        console.log(`✅ ${file} actualizado con versión ${newVersion}`)
      }
    }
  })

  console.log(`🎉 Versión actualizada exitosamente a ${newVersion}`)
} catch (error) {
  console.error("❌ Error actualizando versión:", error.message)
  process.exit(1)
}
