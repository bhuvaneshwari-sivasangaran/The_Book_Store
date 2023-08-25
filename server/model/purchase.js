const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    Customer : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    Books: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            require: true,
        },
        quantity: {
            type: Number,
            require: true,
        }
    }],
    Date :{
        type: Date,
        default: new Date().toUTCString()
    }
});

const Purchase = mongoose.model('Purchase', schema);

module.exports = Purchase;