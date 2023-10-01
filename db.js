const mongoose = require('mongoose');
const mongoclient = require('mongodb').MongoClient;

const url = process.env.database_url;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Database connected successfully');
})
.catch(err => {
    console.log(err);
});

module.exports = mongoose;