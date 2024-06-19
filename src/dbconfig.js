require('dotenv').config(); // Carga las variables de entorno desde .env
module.exports = {
    dbName: process.env.MONGO_DBNAME,
    mongoUrl: process.env.MONGO_URL
}