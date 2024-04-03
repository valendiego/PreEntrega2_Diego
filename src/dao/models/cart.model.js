const mongoose = require('mongoose');

const collection = 'Carts'

const schema = new mongoose.Schema({
    products: {
        type: Array,
    }
});

schema.virtual('id').get(function () {
    return this._id.toString()
});

module.exports = mongoose.model(collection, schema, 'carts');