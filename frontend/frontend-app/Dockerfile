# Usar una imagen oficial de Node.js para construir
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Construir la aplicación React
#RUN npm run build

# Usar una imagen ligera de Nginx para servir el frontend en producción
#FROM nginx:alpine

# Copiar archivos estáticos al directorio de Nginx
#COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80 para servir la aplicación
#EXPOSE 80
EXPOSE 3001

#CMD ["nginx", "-g", "daemon off;"]
CMD ["npm", "start"]
