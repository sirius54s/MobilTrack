const fs = require("fs")

const version = process.argv[2]
const file = "./package.json"

const pkg = JSON.parse(fs.readFileSync(file, "utf8"))
pkg.version = version

fs.writeFileSync(file, JSON.stringify(pkg, null, 2))
console.log(`Updated version to ${version}`)
