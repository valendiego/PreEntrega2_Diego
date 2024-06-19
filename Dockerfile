# Capa pequeña de SO + Node y npm
FROM node:20.11.0

# Configura el directorio de trabajo
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instalar las dependencias de node
RUN npm install

# Reconstruir bcrypt desde el origen
RUN npm rebuild bcrypt --build-from-source

# Copiar nuestro código adentro
COPY . .

# Expone el puerto de la aplicación
EXPOSE 8080

# Ejecutar el servidor
CMD ["npm", "start"]