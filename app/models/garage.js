var mongoose	= require('mongoose');
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
    quantity:Number
});

module.exports = mongoose.model('Garage', GarageItemSchema);