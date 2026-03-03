const { PORT, IS_PROD, ADMIN_PASS_HASH, ADMIN_PASS } = require("./config/env");
const { ensureBaseDirectories } = require("./config/paths");
const { createApp } = require("./app");

if (IS_PROD && !ADMIN_PASS_HASH && ADMIN_PASS === "admin123") {
  process.stdout.write("[WARN] Usa ADMIN_PASS_HASH en producción. La contraseña por defecto es insegura.\n");
}

ensureBaseDirectories();

const app = createApp();

app.listen(PORT, () => {
  process.stdout.write(`🚀 Running at http://localhost:${PORT}\n`);
});
