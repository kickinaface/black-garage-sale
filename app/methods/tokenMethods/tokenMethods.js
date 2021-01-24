function TokenMethods() {
    const jwt = require('jsonwebtoken');
    const Admin = require('../../models/admin');
    const User = require('../../models/user');

    this.generateAccessToken = function generateAccessToken(username) {
        return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '3m' });
    };
    
    this.authenticateToken = function authenticateToken(req, res, next) {
        // Gather the jwt access token from the request header
        var authHeader = req.headers['authorization'];
        var clientUserAgent = req.headers['user-agent'];
        var token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401) // if there isn't any token
    
        jwt.verify(token, process.env.TOKEN_SECRET, function (err, user) {
            if (err){
                return res.status(403).send({message: false});
                //return res.redirect('/login');
            } else {
                // Check for valid token and ip address
                searchTokenWithAgent(token, clientUserAgent, function(data) {
                    //console.log(data);
                    if(data == true) {
                        req.user = user;
                        next(); // pass the execution off to whatever request the client intended
                    }else {
                        //console.log('false:', data);
                        return res.status(403).send({message: false});
                        //return res.redirect('/login');
                    }
                }); 
            }
        });
    };

    this.verifyToken = function verifyToken(token){
        return jwt.verify(token, process.env.TOKEN_SECRET, function (err, user) {
            //console.log('user: ', user);
            if (err){
                //console.log('jwt false')
                return false;
            } else {
                //console.log('jwt true')
                return true; 
            }
        });
    }

    function searchTokenWithAgent (token, userAgent, callback){
        //console.log('useragent: ', userAgent);
        Admin.findOne({token: token, userAgent: userAgent}, function (err, admin){
            if(admin) {
                callback(true);
            } else {
                //callback(false);
                User.findOne({token: token, userAgent: userAgent}, function (err, user) {
                    if(user) {
                        callback(true)
                    } else {
                        callback(false);
                    }
                });
            }
        });
    };

};

var tokenMethods = new TokenMethods();
module.exports = tokenMethods;