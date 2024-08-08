const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    rol: {
        type: String,
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carts'
    },
    last_connection: String,
    documents: [
        {
            name: String,
            reference: String
        }
    ],
    picture: String

})

module.exports = mongoose.model('Users', schema, 'users')