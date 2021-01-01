var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var UserSchema	= new Schema({
	username: String,
    password: String,
    role: String,
    token: String,
    userAgent: String,
    clientIpAddress:String
});

module.exports = mongoose.model('User', UserSchema);