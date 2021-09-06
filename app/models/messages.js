var mongoose	= require('mongoose');
var encrypt = require('mongoose-encryption');
var Schema		= mongoose.Schema;

var MessageSchema	= new Schema({
	fromUser: String,
	toUser: String,
	date: Date,
	message: String,
	fromAvatarId: String
});

require('crypto').randomBytes(32, function(err, buffer) {
	var _32BYTE_BASE64_STRING = buffer.toString('base64');
	//64 bytes
	require('crypto').randomBytes(64, function(err, buffer) {
		var _64BYTE_BASE64_STRING = buffer.toString('base64');
		MessageSchema.plugin(encrypt, { encryptionKey: _32BYTE_BASE64_STRING, signingKey: _64BYTE_BASE64_STRING });
	});
});
module.exports = mongoose.model('Messages', MessageSchema);