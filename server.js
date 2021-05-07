const express		= require('express');
const app			= express();
const bodyParser	= require('body-parser');
const cookieParser 	= require('cookie-parser');
const path 			= require('path');
//
const mongoose	= require('mongoose');
const dbUrl		= 'mongodb://localhost:27017/nifty-chat-old';//'//mongodb://<Carter>:<supertroopermongo32>@ds139817.mlab.com:39817/heroku_0b6l1bdm
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex',true);
mongoose.connect(dbUrl);

const msgModel	= require('./app/models/messages');
const Admin       = require('./app/models/admin');
const User = require('./app/models/user');
const Garage = require('./app/models/garage');
//
const adminRoutes = require('./routes/adminRoutes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes/messageRoutes');
const userRoutes = require('./routes/userRoutes/userRoutes');
const loginRouteController = require('./routes/loginRouteController/loginRouteController');
const uploadRouteController = require('./routes/uploadRoutes/uploadRoutes');
const garageRouteController = require('./routes/garageRouteController/garageRouteController');
const searchRouteController = require('./routes/searchRouteController/searchRouteController');
//
const tokenMethods = require('./app/methods/tokenMethods/tokenMethods');
//
const dotenv = require('dotenv');

const fileUpload = require('express-fileupload');
//const randomUdidGen = require('./app/methods/generateUdid');
const fs = require('fs');

// get config vars
dotenv.config();
// access config var
//console.log(process.env.TOKEN_SECRET);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({useTempFiles: true}));

var port = process.env.PORT || 3000;	//set port

//Routes for the api
var router = express.Router();		//get an instance of the express router

router.use(function (req, res, next) {
	
	//do logging
	
	next();//make sure we go to the next routes and dont stop here
});

//test route to make sure everything is working
// router.get('/', function (req, res) {
// 	res.json({ message: 'Welcome to the node api' });
// });

//more routes for the api will happen here
// router.route('/destory')
// 	.post(function (req, res) {
// 		mongoose.connect(dbUrl, function (){
// 			//Drop the DB
// 			mongoose.connection.db.dropDatabase();
// 			res.json({ message: 'All the messages and admins dropped in: test' });
// 		});
// });

// Set Admin routes
adminRoutes.init(Admin, User, router, tokenMethods);
// Set User routes
userRoutes.init(User, Admin, router, tokenMethods);
// Set Message Routes
messageRoutes.init(msgModel, router, tokenMethods, Admin, User);
// Set Login Route Controller
loginRouteController.init(Admin, User, router, tokenMethods);
//file upload routes
uploadRouteController.init(Admin, User, router, fs, tokenMethods);
//Garage routes
garageRouteController.init(Garage, Admin, User, router, fs, tokenMethods);
// Search routes
searchRouteController.init(router, tokenMethods, Admin, User, Garage);
//
router.route('/authRequest').get(tokenMethods.authenticateToken, function (req, res) {
	var usersCookie = req.cookies.bCookieToken;
	//
	searchIp(usersCookie, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.json({authenticated: true});
		} else {
			res.redirect('/logout');
		}
	});
});

//REGISTER OUR ROUTES ---------------------------------
//all of the routes will be prefixed with /api
app.use('/api', router);
app.use(express.static(__dirname + '/public'));

app.get('/avatar/:userId/:image', function (req, res) {
	//console.log('requesting image');
	var imagePath = (__dirname+'/avatar/'+req.params.userId+'/'+req.params.image);
	if(fs.existsSync(imagePath)){
		//console.log('image exists, show it');
		res.sendFile(path.join(imagePath));
	} else {
		res.sendStatus(404);
		//console.log('image does not exist');
	}
});

app.get('/garageImages/:itemId/:image', function (req, res){
	var imagePath = (__dirname+'/garageImages/'+req.params.itemId+'/'+req.params.image);
	var defaultImagePath= (__dirname+'/defaultPhotos/package-icon.png');

	if(fs.existsSync(imagePath)){
		//console.log('image exists, show it');
		res.sendFile(path.join(imagePath));
	} else {
		res.sendFile(path.join(defaultImagePath));
		//console.log('image does not exist');
	}
});

// Handle page routing
app.get('/login', function (req, res){
	res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.get('/profile', function (req, res) {
	var usersCookie = req.cookies.bCookieToken;
	var userAgent = req.headers['user-agent'];

	searchIp(usersCookie, function(data, user) {
		//	
		if(data == true && user.token == req.cookies.bCookieToken && user.userAgent == userAgent) {
			if(user.role == 'admin'){
				res.sendFile(path.join(__dirname+'/app/pages/adminProfile.html'));
			}else if(user.role == 'basic' || user.role == 'subscriber'){
				res.sendFile(path.join(__dirname+'/app/pages/basicProfile.html'));
			}
			
		} else {
			//res.sendStatus(404);
			res.redirect('/logout');
		}
	});
});

app.get('/garage', function (req, res) {
	var usersCookie = req.cookies.bCookieToken;
	var userAgent = req.headers['user-agent'];
	searchIp(usersCookie, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/garage.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/garage/user/:userID', function (req, res){
	// BUILD STEP: Remove/change URL within this file for correct linkage.
	res.sendFile(path.join(__dirname+'/public/userGarage.html'));
});

app.get('/garage/item/:itemID', function (req, res){
	Garage.findOne({
		_id: req.params.itemID
	}, function (err, gItem){
		if(err){
			//res.send(err);
			res.status(403).send({message: 'There is no item by that ID'});
		} else if(gItem != null){
			// BUILD STEP: Remove/change URL within this file for correct linkage.
			var preMadeDocument = "<html>"+
									"<head>"+
										"<title>Black Garage Sale -ITEM</title>"+
										"<meta charset='utf-8'>"+
										"<meta http-equiv='X-UA-Compatible' content='IE=edge'></meta>"+
										"<meta name='viewport' content='width=device-width, initial-scale=1'>"+
										"<meta property='og:url'                content='/garage/item/"+gItem._id+"' />"+
										"<meta property='og:type'               content='article' />"+
										"<meta property='og:title'              content='"+gItem.title+"' />"+
										"<meta property='og:description'        content='"+gItem.description+"' />"+
										"<meta property='og:image'              content='"+gItem.itemImageUrl1+"' />"+
										"<link rel='stylesheet' href='/css/navigation.css'>"+
										"<link rel='stylesheet' href='/css/main.css'>"+
										"<link rel='stylesheet' href='/css/login.css'>"+
										"<link rel='stylesheet' href='/css/garageItem.css'>"+
										"<script type='text/javascript' src='/js/superUtil.js'></script>"+
										"<script type='text/javascript' src='/js/garageItem.js'></script>"+
										"<style>body{font-family: Arial, Helvetica, sans-serif;}</style>"+
									"</head>"+
									"<body>"+
									"<div class='garageDoor'></div>"+
									"<div class='navigation'>"+
										"<div class='navLogo'><i>Black</i> Garage Sale</div>"+
										"<div class='navMessages'></div>"+
										"<ul class='navLinks'></ul>"+
									"</div>"+
									"<br/>"+
									"<div class='baseBoard'>"+
										"<img src='/garageImages/"+gItem._id+"/garageItemImage_1.jpg' width='20%;' /> &nbsp;&nbsp;"+
										"<img src='/garageImages/"+gItem._id+"/garageItemImage_2.jpg' width='20%;' /> &nbsp;&nbsp;"+
										"<img src='/garageImages/"+gItem._id+"/garageItemImage_3.jpg' width='20%;' /> &nbsp;&nbsp;"+
									"</div>"+
									"<br/>"+
									"<br/>"+
									"<div class='itemDescriptionWrapper'>"+
									"<h2>"+gItem.title+"</h2>"+
									"<br/>"+
									"<b>Item ID:</b> "+ gItem._id+
									"<br/>"+
									"<b>Item Owner:</b> <span class='createdBy'>"+ gItem.createdBy+"</span>"+
									"<br />"+
									"<br />"+
									"<img onclick=gotoUserGarage('"+gItem.createdBy+"'); class='ownerAvatar' src='/img/default-profile-icon-16.png' width='10%'/>"+
									"<br/>"+
									"<br/>"+
									"<b>Description: </b>"+
									"<p>"+
										gItem.description+
									"</p>"+
									"<br/>"+
									"<b>Category:</b>"+
									"<p>"+gItem.category+"</p>"+
									"<br/>"+
									"<p><b>Quantity</b><br/>"+gItem.quantity+" left</p>"+
									"<br/>"+
									"<p><b>Price: </b><span class='itemPrice'>$"+parseFloat(gItem.price).toFixed(2)+"</span></p>"+
									"<br/>"+
									"<div class='isSold'><b>isSold:</b> <span>"+ gItem.isSold+"</span></div>"+
									"<div class='isAvailable'><b>Available:</b> <span>"+ gItem.isAvailable+"</span></div>"+
									"<a class='buyItemButton' href='/messages?createdBy="+gItem.createdBy+"&garageItemId="+gItem._id+"'><button>Buy Item</button></a>"+
									"<div class='itemErrors'></div>"+
									"<br/>"+
									"<br/>"+
									"<br/>"+
									"</div>"+
									"</body>"+
								"</html>";
			//res.send(gItem);
			res.set('Content-Type', 'text/html');
			res.send(Buffer.from(preMadeDocument));
		} else {
			res.status(403).send({message: 'There is no item by that ID'});
		}
	});
});

app.get('/search', function (req, res) {
	var usersCookie = req.cookies.bCookieToken;
	var userAgent = req.headers['user-agent'];
	searchIp(usersCookie, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/search.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/messages', function (req, res) {
	var usersCookie = req.cookies.bCookieToken;
	var userAgent = req.headers['user-agent'];
	searchIp(usersCookie, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/messages.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/logout', function (req, res) { 
	var usersCookie = req.cookies.bCookieToken;
	var userAgent = req.headers['user-agent'];
	searchIp(usersCookie, function(data, u) {
		//console.log(clientIp, data, u);
		if(data == true) {
			u.token = null;
			u.userAgent = null;
			u.clientIpAddress = null;
			u.forgotPass = null;
			u.save();
			//console.log('u: ', u);
			//res.sendFile(path.join(__dirname+'/public/login.html'));
			res.redirect('/login');
		} else {
			res.redirect('/login');
			//res.sendStatus(403);
		}
	});
	//res.sendFile(path.join(__dirname+'/public/logout.html'));
});

app.get('/register', function (req, res) {
	res.sendFile(path.join(__dirname+'/public/register.html'));
});

function searchIp(usersToken, callback){
	Admin.findOne({token: usersToken}, function (err, admin){
		if(admin) {
			callback(tokenMethods.verifyToken(admin.token), admin);
		} else {
			//callback(false);
			User.findOne({token: usersToken}, function (err, user) {
				if(user) {
					callback(tokenMethods.verifyToken(user.token), user);
				} else {
					callback(false);
					//res.sendStatus(403);
				}
			});
		}
	});
};

//START THE server
//=====================================================
app.listen(port);
console.log('The API is running on port: ', port);
