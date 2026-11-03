import crypto from "node:crypto"
import fs from "node:fs"

const secret = crypto.randomBytes(32).toString("base64")
fs.appendFileSync(
  new URL("../../.env", import.meta.url),
  `\n# dimah-s3 upload tickets. At least 32 characters, the same on every instance.\nDIMAH_S3_SECRET="${secret}"\n`
)
console.log("appended")
