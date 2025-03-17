# Usar una imagen oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias antes del código fuente para aprovechar la caché
COPY package*.json ./

RUN npm install --production

# Copiar el resto del código después de instalar dependencias
COPY . .

# Exponer el puerto del backend
EXPOSE 3000

# Comando por defecto
CMD ["node", "server.js"]
