require('dotenv').config(); // Carga las variables de entorno desde .env
module.exports = {
    dbName: process.env.DB_NAME,
    mongoUrl: process.env.MONGO_URL
}