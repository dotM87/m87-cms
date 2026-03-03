#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
STAMP="$(date +"%Y%m%d-%H%M%S")"
TARGET="$BACKUP_DIR/cms-backup-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$TARGET" \
  -C "$ROOT_DIR" \
  content \
  public/uploads \
  .env

echo "Backup creado: $TARGET"
