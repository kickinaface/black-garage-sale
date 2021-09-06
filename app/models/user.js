var mongoose	= require('mongoose');
var encrypt = require('mongoose-encryption');
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
    forgotPass:String,
    emailMessages:Boolean,
    isHidden:Boolean
});

UserSchema.index({'firstName':'text', 'lastName':'text', 'username':'text'});

require('crypto').randomBytes(32, function(err, buffer) {
	var _32BYTE_BASE64_STRING = buffer.toString('base64');
	//64 bytes
	require('crypto').randomBytes(64, function(err, buffer) {
		var _64BYTE_BASE64_STRING = buffer.toString('base64');
		UserSchema.plugin(encrypt, { encryptionKey: _32BYTE_BASE64_STRING, signingKey: _64BYTE_BASE64_STRING });
	});
});
module.exports = mongoose.model('User', UserSchema);