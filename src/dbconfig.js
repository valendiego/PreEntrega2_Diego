require('dotenv').config(); // Carga las variables de entorno desde .env
const db = process.env.MONGO_DBNAME
console.log(db)
module.exports = {
    dbName: process.env.MONGO_DBNAME,
    mongoUrl: process.env.MONGO_URL
}