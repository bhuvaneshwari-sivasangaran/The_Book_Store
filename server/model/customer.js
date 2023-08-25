const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    Name : {
        type: String,
        require : true
    },
    Phone : {
        type: String,
        require : true,
        unique : true
    },
    Email : {
        type: String,
        unique : true
    }
});

const Customer = mongoose.model('Customer', schema);

module.exports = Customer;