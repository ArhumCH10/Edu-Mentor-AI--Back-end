const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/signUpRoutes');
const URL = 'mongodb+srv://arhumnaveed092:Ayeshairshad911@cluster0.trsuqsj.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();

app.use(express.json());

app.use(cors());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/teacher', userRoutes);

mongoose.connect(URL).then(result => {
    app.listen(8080);
}).catch(err => {
    console.log(err);
});
