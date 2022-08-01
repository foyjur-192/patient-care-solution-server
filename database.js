'use strict';
const mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect('mongodb://localhost/upload-files-database',{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
       useFindAndModify: true,
    }).then(() => console.log('connected to Mongodb...'));
}