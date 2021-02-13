var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var AdminSchema	= new Schema({
	firstName: String,
	lastName: String,
	username: String,
	password: String,
	role: String,
	token: String,
	userAgent:String,
	clientIpAddress:String,
	forgotPass:String
});

AdminSchema.index({'firstName':'text', 'lastName':'text', 'username':'text'});
module.exports = mongoose.model('Admin', AdminSchema);