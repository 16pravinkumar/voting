const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/voting')

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    phone: Number,
    hasVoted: { type: Boolean, default: false }, 
    vote: { type: String, default: null } 
});


module.exports = mongoose.model('user', userSchema);
