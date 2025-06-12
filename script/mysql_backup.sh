#!/bin/bash

CONTAINER_NAME="mysql-container"
DB_NAME="chatbot_favip"
DB_USER="root"
DB_PASS="sua_senha"
BACKUP_DIR="/root/backups"

DATE=$(date +%F)
FILENAME="${DB_NAME}_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER_NAME" mysqldump -u "$DB_USER" -p"$DB_PASS" --single-transaction "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"

cat /root/scripts/backup.log