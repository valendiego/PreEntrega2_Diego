require('dotenv').config(); // Carga las variables de entorno desde .env
module.exports = {
    appId: process.env.GH_APPID,
    clientID: process.env.GH_CLIENTID,
    clientSecret: process.env.GH_CLIENTSECRET,
    callbackURL: process.env.GH_CALLBACK
}