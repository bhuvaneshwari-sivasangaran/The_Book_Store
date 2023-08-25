const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    Isbn : {
        type: String,
        require : true,
        unique : true,
    },
    Title : {
        type: String,
        require : true
    },
    Author : {
        type: String,
        require : true
    },
    Quantity : {
        type: Number,
        require: true
    },
    BookInfo : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookInfo',
    },
});

const Book = mongoose.model('Book', schema);

module.exports = Book;