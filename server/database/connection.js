const mongoose = require('mongoose');

const connect_db = async () => {
    try {
        console.log('Connecting to database...');
        const con = await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected!');
    } catch(err) {
        console.log('Error while connecting to database!!' + err);
        process.exit(1);
    }
}

module.exports = connect_db;