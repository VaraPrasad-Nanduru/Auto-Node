const mongoose = require('mongoose');

const connectMongo = () => {
    return mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectMongo;
