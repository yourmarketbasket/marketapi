const mongoose = require('mongoose');
const mongoclient = require('mongodb').MongoClient;

const url = process.env.DATABASE_URL;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('DB_STATUS_OK');
})
.catch(err => {
    console.log(err);
});

module.exports = mongoose;