import fs from "node:fs"

const text = fs.readFileSync(new URL("../../.env", import.meta.url), "utf8")
const keys = text
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split("=")[0])
const secretLine = text
  .split(/\r?\n/)
  .find((line) => line.startsWith("DIMAH_S3_SECRET="))
const raw = secretLine?.slice("DIMAH_S3_SECRET=".length) ?? ""
const value = raw.startsWith('"') ? raw.slice(1, -1) : raw
console.log(keys.join(", "))
console.log(`secretLength=${value.length}`)
