const fs = require("fs");
const path = require("path");

const sourceKeystore = path.join(__dirname, "..", "my-release-key.keystore");
const targetDir = path.join(__dirname, "..", "android", "app");
const targetKeystore = path.join(targetDir, "my-release-key.keystore");

try {
  if (!fs.existsSync(sourceKeystore)) {
    console.error("Source keystore not found");
    process.exit(1);
  }

  if (!fs.existsSync(targetDir)) {
    console.error("Android app directory not found");
    process.exit(1);
  }

  fs.copyFileSync(sourceKeystore, targetKeystore);
  console.log("Keystore copied successfully");
} catch (error) {
  console.error("Error copying keystore:", error);
  process.exit(1);
}
