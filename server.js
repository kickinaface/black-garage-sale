const express		= require('express');
const app			= express();
const bodyParser	= require('body-parser');
const path 			= require('path');
//
const mongoose	= require('mongoose');
const dbUrl		= 'mongodb://localhost:27017/nifty-chat-old';//'//mongodb://<Carter>:<supertroopermongo32>@ds139817.mlab.com:39817/heroku_0b6l1bdm
mongoose.connect(dbUrl);
const msgModel	= require('./app/models/messages');
const Admin       = require('./app/models/admin');
const User = require('./app/models/user');
//
const adminRoutes = require('./routes/adminRoutes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes/messageRoutes');
const userRoutes = require('./routes/userRoutes/userRoutes');
const loginRouteController = require('./routes/loginRouteController/loginRouteController');
const uploadRouteController = require('./routes/uploadRoutes/uploadRoutes');
//
const tokenMethods = require('./app/methods/tokenMethods/tokenMethods');
//
const dotenv = require('dotenv');

const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer');
const mailController = require('./app/methods/mailController');
const randomUdidGen = require('./app/methods/generateUdid');
const fs = require('fs');

// get config vars
dotenv.config();
mailController.init(nodemailer);
// access config var
//console.log(process.env.TOKEN_SECRET);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(fileUpload());

var port = process.env.PORT || 3000;	//set port

//Routes for the api
var router = express.Router();		//get an instance of the express router

router.use(function (req, res, next) {
	//do logging
	//console.log('Something is happening');
	//console.log('A person has origin from: ', req);
	//console.log('Request was made: User-Agent: ', req.headers['user-agent']);
	//console.log('Request was made: token: ', req.headers['token']);
	//console.log(require('crypto').randomBytes(64).toString('hex'));
	//console.log('reasdfasdf params: ', req.query.username)
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
//
router.route('/authRequest').get(tokenMethods.authenticateToken, function (req, res) {
	var clientIp = req.connection.remoteAddress;
	var userAgent = req.headers['user-agent'];
	//console.log('requesting authenticated token response.', req.headers['user-agent']);
	//
	searchIp(clientIp, userAgent, function(data) {
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
	console.log('requesting image');
	var imagePath = (__dirname+'/avatar/'+req.params.userId+'/'+req.params.image);
	if(fs.existsSync(imagePath)){
		console.log('image exists, show it');
		res.sendFile(path.join(imagePath));
	} else {
		res.sendStatus(404);
		//console.log('image does not exist');
	}
});

// Handle page routing
app.get('/login', function (req, res){
	res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.get('/profile', function (req, res) {
	//console.log('token: ', req.body);
	var clientIp = req.connection.remoteAddress;
	//console.log(clientIp);	
	var userAgent = req.headers['user-agent'];
	searchIp(clientIp, userAgent, function(data, user) {
		console.log('data: ', data);
		console.log('userIP: ', clientIp);
		console.log('storedIP: ', user.clientIpAddress);
		console.log('userAgent: ', userAgent);
		console.log('stored User Agent: ', user.userAgent);		
		if(data == true && clientIp == user.clientIpAddress && user.userAgent == userAgent) {
			if(user.role == 'admin'){
				res.sendFile(path.join(__dirname+'/app/pages/adminProfile.html'));
			}else if(user.role == 'basic'){
				res.sendFile(path.join(__dirname+'/app/pages/basicProfile.html'));
			}
			
		} else {
			//res.sendStatus(404);
			res.redirect('/logout');
		}
	});
});

app.get('/garage', function (req, res) {
	//console.log('token: ', req.body);
	var clientIp = req.connection.remoteAddress;
	var userAgent = req.headers['user-agent'];
	searchIp(clientIp, userAgent, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/garage.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/search', function (req, res) {
	var clientIp = req.connection.remoteAddress;
	var userAgent = req.headers['user-agent'];
	searchIp(clientIp, userAgent, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/search.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/messages', function (req, res) {
	var clientIp = req.connection.remoteAddress;
	var userAgent = req.headers['user-agent'];
	searchIp(clientIp, userAgent, function(data) {
		//console.log(clientIp, data);
		if(data == true) {
			res.sendFile(path.join(__dirname+'/public/messages.html'));
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/logout', function (req, res) { 
	var clientIp = req.connection.remoteAddress;
	var userAgent = req.headers['user-agent'];
	searchIp(clientIp, userAgent, function(data, u) {
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

function searchIp(ip, userAgent, callback){
	Admin.findOne({clientIpAddress: ip, userAgent: userAgent}, function (err, admin){
		if(admin) {
			callback(tokenMethods.verifyToken(admin.token), admin);
		} else {
			//callback(false);
			User.findOne({clientIpAddress: ip, userAgent:userAgent}, function (err, user) {
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
