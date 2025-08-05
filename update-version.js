import fs from "fs"

const newVersion = process.argv[2]

if (!newVersion) {
  console.error("❌ No version provided.")
  process.exit(1)
}

const pkgPath = "./package.json"

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  pkg.version = newVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
  console.log(`✅ Version updated to ${newVersion}`)
} catch (err) {
  console.error("❌ Failed to update version:", err)
  process.exit(1)
}
