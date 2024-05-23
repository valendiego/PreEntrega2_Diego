// module.exports = {
//     dbName: "techStore",
//     mongoUrl: 'mongodb+srv://valendiego:nomiteamo9@valencluster.hsozzwx.mongodb.net/?retryWrites=true&w=majority&appName=ValenCluster'
// }
require('dotenv').config(); // Carga las variables de entorno desde .env
module.exports = {
    dbName: process.env.MONGO_DBNAME,
    mongoUrl: process.env.MONGO_URL
}