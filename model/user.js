/**
 * Created by Rahul Aware on 2/26/17.
 */
var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String,
    keystrokes:String
});
var User = mongoose.model('users', UserSchema);

module.exports = User;