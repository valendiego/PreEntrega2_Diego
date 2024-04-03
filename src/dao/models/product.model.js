const mongoose = require('mongoose');

const collection = 'Products'

const schema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        require: true
    },

    price: {
        type: Number,
        require: true,
        min: 1
    },

    thumbnail: {
        type: String,
        default: 'Sin Imagen'
    },

    code: {
        type: String,
        unique: true,
        require: true
    },

    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    },

    stock: {
        type: Number,
        require: true,
        min: 0
    }
});

schema.virtual('id').get(function () {
    return this._id.toString()
});

module.exports = mongoose.model(collection, schema, 'products');