# m87-cms

CMS flat-file en Node.js con Express, arquitectura modular, panel admin, frontmatter YAML, carga de imágenes y soporte de tema claro/oscuro.

## Arquitectura

- `server.js`: entrada mínima.
- `src/server.js`: bootstrap de servidor.
- `src/app.js`: creación de app Express.
- `src/routes`: definición de rutas.
- `src/controllers`: controladores HTTP.
- `src/services`: lógica de negocio.
- `src/repositories`: acceso a sistema de archivos.
- `src/middlewares`: seguridad, auth y errores centralizados.
- `public/js`: módulos frontend (`home.js`, `post.js`, `admin.js`, `theme.js`).

## Producción (resumen)

### 1) Variables de entorno
1. Copia `.env.example` a `.env`.
2. Genera hash de contraseña:
   - `pnpm hash:password -- tu_clave_segura`
3. Pega el hash en `ADMIN_PASS_HASH` y deja `ADMIN_PASS` vacío.

### 2) Instalación
- `pnpm install --prod`

### 3) Correr en producción local
- `pnpm start:prod`

### 4) Correr con PM2
- `pm2 start ecosystem.config.cjs`
- `pm2 save`
- `pm2 startup`

### 5) Nginx + HTTPS
- Usa [deploy/nginx.conf](deploy/nginx.conf) como base de virtual host.
- Reemplaza `tu-dominio.com`.
- Activa HTTPS con Certbot:
  - `sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com`

### 6) Backups
- Script incluido: [scripts/backup.sh](scripts/backup.sh)
- Ejecuta manual:
  - `bash scripts/backup.sh`
- Recomendado en cron diario.

## Endurecimiento incluido
- Sanitización de HTML renderizado desde Markdown.
- Cookies de sesión seguras en producción (`Secure`, `HttpOnly`, `SameSite`).
- Rate limit para login y subida de imágenes.
- Validación de tipo/extensión de archivos subidos.
- Security headers HTTP (CSP, HSTS en producción, `X-Frame-Options`, etc.).

## Deploy automático con GitHub Actions (SSH)

Workflow incluido: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

### Secrets requeridos en GitHub
Configura estos secrets en tu repositorio (`Settings > Secrets and variables > Actions`):

- `VPS_HOST`: IP o dominio del servidor
- `VPS_USER`: usuario SSH (ej. `deploy`)
- `VPS_SSH_KEY`: clave privada SSH (contenido completo)
- `VPS_PORT` (opcional): por defecto `22`
- `VPS_APP_DIR` (opcional): ruta del proyecto en el VPS (si no se define, usa `~/apps/m87-cms`)

### Bootstrap inicial en VPS (una sola vez)
```bash
mkdir -p ~/apps
cd ~/apps
git clone <tu_repo_git> m87-cms
cd m87-cms
cp .env.example .env
pnpm install --prod
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### ¿Cuándo se despliega?
- En cada `push` a `main`.
- También manualmente desde la pestaña `Actions` con `workflow_dispatch`.
