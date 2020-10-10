const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const DB = process.env.MONGO_LOCAL_CONN_URL.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

// SET UP DATABASE
const connectDB = () => {
    //Configure mongoose's promise to global promise
    mongoose.promise = global.Promise;
    mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(() => console.log('DB connection successful!'));
};

module.exports = connectDB;