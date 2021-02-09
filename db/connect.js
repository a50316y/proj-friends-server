//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
mongoose.connect('mongodb://localhost:27017/member', { useNewUrlParser: true, useUnifiedTopology:true});

mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('open', console.error.bind(console, 'MongoDB connection success:'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
