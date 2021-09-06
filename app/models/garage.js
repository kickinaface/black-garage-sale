var mongoose	= require('mongoose');
var encrypt = require('mongoose-encryption');
var Schema		= mongoose.Schema;

var GarageItemSchema	= new Schema({
	createdBy: String,
    date: Date,
    title: String,
    description:String,
    category:String,
	rating: Number,
    comments: Array,
    price: Number,
    isSold:Boolean,
    isAvailable:Boolean,
    quantity:Number,
    isHidden:Boolean
});

GarageItemSchema.index({'title':'text', 'description':'text', 'category':'text'});

require('crypto').randomBytes(32, function(err, buffer) {
	var _32BYTE_BASE64_STRING = buffer.toString('base64');
	//64 bytes
	require('crypto').randomBytes(64, function(err, buffer) {
		var _64BYTE_BASE64_STRING = buffer.toString('base64');
		GarageItemSchema.plugin(encrypt, { encryptionKey: _32BYTE_BASE64_STRING, signingKey: _64BYTE_BASE64_STRING });
	});
});
module.exports = mongoose.model('Garage', GarageItemSchema);