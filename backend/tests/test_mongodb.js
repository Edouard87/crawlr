const mongoose = require('mongoose');
const mongodb = require('mongodb');
const env = require('dotenv');

env.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongotestdb';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })