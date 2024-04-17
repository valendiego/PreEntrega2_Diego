const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 1
    },

    thumbnail: {
        type: String,
        default: 'Sin Imagen'
    },

    code: {
        type: String,
        unique: true,
        required: true
    },

    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    }
});

schema.virtual('id').get(function () {
    return this._id.toString()
});

schema.plugin(mongoosePaginate);

module.exports = mongoose.model('Products', schema, 'products');