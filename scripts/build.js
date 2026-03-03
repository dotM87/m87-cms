const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const itemsToCopy = [
  "server.js",
  "package.json",
  "pnpm-lock.yaml",
  ".env.example",
  "public",
  "admin",
  "content"
];

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

fs.mkdirSync(distDir, { recursive: true });

for (const item of itemsToCopy) {
  const sourcePath = path.join(rootDir, item);
  if (!fs.existsSync(sourcePath)) {
    continue;
  }

  const destinationPath = path.join(distDir, item);
  const sourceStats = fs.statSync(sourcePath);

  if (sourceStats.isDirectory()) {
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

console.log("Build completed in ./dist");
