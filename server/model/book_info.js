const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    Quantity : {
        type: Number,
        require: true
    },
    Price : {
        type: Number,
        require: true
    },
    Description : {
        type: String
    }
});

const BookInfo = mongoose.model('BookInfo', schema);

module.exports = BookInfo;