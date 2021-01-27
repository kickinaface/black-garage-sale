var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var MessageSchema	= new Schema({
	fromUser: String,
	toUser: String,
	date: Date,
	message: String,
	fromAvatarId: String
});

module.exports = mongoose.model('Messages', MessageSchema);