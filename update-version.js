const fs = require("fs")
const path = require("path")

const newVersion = process.argv[2]
if (!newVersion) {
  console.error("No version specified!")
  process.exit(1)
}

const packageJsonPath = path.resolve(__dirname, "package.json")
const packageJson = require(packageJsonPath)

packageJson.version = newVersion

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log(`Version updated to ${newVersion} in package.json`)
