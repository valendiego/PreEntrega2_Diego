const mongoose = require('mongoose');

const collection = 'Messages';

const schema = new mongoose.Schema({
    user: {
        type: String,
        require: true
    },
    messages: {
        type: Array,
        require: true
    }
}, { timestamps: true });

module.exports = mongoose.model(collection, schema, 'messages');