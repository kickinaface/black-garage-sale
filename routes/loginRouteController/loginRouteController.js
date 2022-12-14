function LoginRouteController() {
    this.init = function init(Admin, User, router, tokenMethods) {
        var bcrypt = require('bcrypt');
        router.route('/login').post(function (req, res) {
            var clientUserAgent = req.headers['user-agent'];
            var clientIp = req.connection.remoteAddress;
            //console.log('clientUserAgent', clientUserAgent);
            //console.log('ip: ', req.ip);
            var errorMessage = 'Incorrect login credentials. Please check and try again.';
            var username = req.body.username;
            var password = req.body.password;
            //console.log('username: ', username, ' password: ', password);
            if (username === undefined || password === undefined || username === '' || password === '') {
                res.status(404).send({ message: 'ERROR: You must define a username and password'});
            } else {
                Admin.findOne({username:username}, function (err, admin) {
                    if (admin == null) {
                        User.findOne({username:username}, function (err, user) {
                            if(user == null) {
                                res.status(404).send({message: errorMessage});
                            } else {
                                if(bcrypt.compareSync(password, user.password)) {
                                    // Passwords match send user the token
                                    var token = tokenMethods.generateAccessToken({ username: username });
                                    user.token = token;
                                    user.userAgent = clientUserAgent;
                                    user.clientIpAddress = clientIp;
                                    user.save();
                                    res.cookie('bCookieToken', user.token);
                                    res.json({ 
                                        token: token,
                                        userId:user._id,
                                        email: user.username
                                    });
                                } else {
                                    // Passwords don't match
                                    //console.log('password: ', password, 'forgotPass: ', user.forgotPass);
                                    if(password == user.forgotPass){
                                        var token = tokenMethods.generateAccessToken({ username: username });
                                        user.token = token;
                                        user.userAgent = clientUserAgent;
                                        user.clientIpAddress = clientIp;
                                        user.save();
                                        res.cookie('bCookieToken', user.token);
                                        res.json({ 
                                            token: token,
                                            userId:user._id,
                                            email: user.username
                                        });
                                    } else if(password != user.forgotPass || user.forgotPass == null) {
                                        res.status(404).send({message: errorMessage});
                                    }
                                    
                                }
                            }
                        });
                    } else {
                        //console.log('found the user but check the hashed password', admin);
                        if(bcrypt.compareSync(password, admin.password)) {
                            // Passwords match send user the token
                            var token = tokenMethods.generateAccessToken({ username: username });
                            admin.token = token;
                            admin.userAgent = clientUserAgent;
                            admin.clientIpAddress = clientIp;
                            admin.save();
                            res.cookie('bCookieToken', admin.token);
                            res.json({ 
                                token: token,
                                userId:admin._id,
                                email: admin.username
                            });
                        } else {
                            // Passwords don't match
                            //res.status(404).send({message: errorMessage});
                            if(password == admin.forgotPass){
                                var adminToken = tokenMethods.generateAccessToken({ username: username });
                                admin.token = adminToken;
                                admin.userAgent = clientUserAgent;
                                admin.clientIpAddress = clientIp;
                                res.cookie('bCookieToken', admin.token);
                                admin.save();
                                //console.log('user: ', user);
                                res.json({ 
                                    token: adminToken,
                                    userId:admin._id,
                                    email: admin.username
                                });
                            } else if(password != admin.forgotPass || admin.forgotPass == null) {
                                res.status(404).send({message: errorMessage});
                            }
                        }
                    }
                });
            }
        });
    };
};
var loginRouteController = new LoginRouteController();
module.exports = loginRouteController;