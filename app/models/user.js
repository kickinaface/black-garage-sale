var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var UserSchema	= new Schema({
    firstName: String,
    lastName: String,
	username: String,
    password: String,
    role: String,
    token: String,
    userAgent: String,
    clientIpAddress:String,
    forgotPass:String
});

module.exports = mongoose.model('User', UserSchema);