const mongoose = require('mongoose');
const mongoclient = require('mongodb').MongoClient;

const url = process.env.database_url;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('DB_STATUS_OK');
})
.catch(err => {
    console.log(err);
});

module.exports = mongoose;