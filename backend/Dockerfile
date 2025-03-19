# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Expone el puerto del backend
EXPOSE 3000

# Script para iniciar la aplicación
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Comando por defecto para iniciar el servidor
CMD ["/start.sh"]
