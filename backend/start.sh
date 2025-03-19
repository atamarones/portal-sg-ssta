#!/bin/sh

# Ejecutar migraciones de Prisma
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Iniciar la aplicación
echo "Iniciando la aplicación..."
npm run dev 