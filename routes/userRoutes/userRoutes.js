function UserRoutes() {
    this.init = function init(User, Admin, router, tokenMethods) {
        const bcrypt = require('bcrypt');
        // Create basic user.
        router.route('/user')
            .post(function (req, res) {
                var user = new User();
                var username = req.body.username;
                var password = req.body.password;
                var alreadyExistMessage = 'This user already exists, please sign in.';

                if (username === undefined || password === undefined || username === '' || password === '') {
                    res.status(404).send({ message: 'ERROR: You must define a username and password'});
                } if(ValidateEmail(username) == false){
                    res.status(404).send({ message: 'ERROR: You must provide a valid email address.'});
                }else {
                    // Look to see if there are any admins currently by this name. If so, do not let them create a user
                    Admin.findOne({username:username}, function (err, adminUser) {
                        // no admin, continue
                        if(adminUser == null) {
                            //console.log('no admin found, search for basic user existence..');
                            // Look for a basic user before creating a new one.
                            User.findOne({username:username}, function (err, newUser) {
                                if(newUser == null) {
                                    //console.log('no User and no admin, create a brand new user');
                                    user.username = username;
                                    user.password = bcrypt.hashSync(password, 10);
                                    user.role = 'basic';
                                    //
                                    user.save(function (err) {
                                        if (err){
                                            res.send(err);
                                        } else {
                                            //console.log('Created new User. Please log in.');
                                            var nodemailer = require('nodemailer');
                                            var mailController = require('../../app/methods/mailController');
                                            mailController.init(nodemailer);
                                            mailController.sendNewAccountEmail(username);
                                            res.json({ message: 'User Created!' });
                                        }
                                    });
                                } else {
                                    res.status(403).send({message: alreadyExistMessage});
                                }
                            });
                        }else {
                            res.status(403).send({message: alreadyExistMessage });
                        }
                    });
                }
            })

        router.route('/updateName/:user_id',)
            .post(tokenMethods.authenticateToken, function (req, res){
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                var changedFirstName = req.body.firstName;
                var changedLastName = req.body.lastName;
                var userID = req.params.user_id;
                //What user wishes to change their name
                Admin.findOne({_id: userID, token: verifiedToken}, function (err, admin) {
                    if (err) { res.send(err) }

                    if (admin == null){
                        //console.log('no admin user, search for regular user')
                        User.findOne({_id:userID, token: verifiedToken}, function (err, user) {
                            // console.log(err);
                            // console.log(user);
                            if(err) {res.send(err)};
                            if(user == null){
                                res.sendStatus(403);
                            } else {
                                //User found change first or last names
                                if(!changedFirstName){
                                    console.log('firstName blank');
                                } else {
                                    user.firstName = changedFirstName;
                                }
                                if(!changedLastName){
                                    console.log('lastName blank');
                                } else {
                                    user.lastName = changedLastName;
                                }
                                if(!changedFirstName && !changedLastName){
                                    res.status(403).json({message:'fields must not be empty'});
                                } else {
                                    user.save();
                                    res.json({message:'Successfully Updated'});
                                }
                                
                            }
                            
                        });
                    } else {
                        // Admin found change first or last name
                        if(!changedFirstName){
                            console.log('firstName blank');
                        } else {
                            admin.firstName = changedFirstName;
                        }
                        if(!changedLastName){
                            console.log('lastName blank');
                        } else {
                            admin.lastName = changedLastName;
                        }
                        if(!changedFirstName && !changedLastName){
                            res.status(403).json({message:'fields must not be empty'});
                        } else {
                            admin.save();
                            res.json({message:'Successfully Updated'});
                        }
                    }
                });
            });
        
        router.route('/users')
            .get(tokenMethods.authenticateToken, function (req, res) {
                User.find(function (err, users){
                    var preparedUsers = [];
                    for(var u=0; u<=users.length-1; u++){
                        var userObject = {
                            _id: users[u]._id,
                            username:users[u].username,
                            role: users[u].role,
                            userAgent: users[u].userAgent,
                            clientIpAddress: users[u].clientIpAddress
                        };
                        preparedUsers.push(userObject);
                    }
                    res.json(preparedUsers);
                });
            });

        router.route('/displayName/:user_id')
            .get(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                var userID = req.params.user_id;
                // console.log('userId: ', req.params.user_id);
                // console.log('verifiedToken: ', verifiedToken);
                Admin.findOne({_id:userID, token: verifiedToken}, function (err, admin){
                    if (err) {res.send(err) };
                    // console.log(admin);
                    if(admin == null) {
                        //res.status(403).send({message: ''})
                        // No admin, look for basic user
                        User.findOne({_id:userID, token:verifiedToken}, function(err, user) {
                            if(err){res.send(err)};
                            if(user == null) {
                                res.sendStatus(403);
                            } else {
                                res.json({firstName:user.firstName, lastName: user.lastName});
                            }
                        });
                    } else {
                        res.json({firstName:admin.firstName, lastName: admin.lastName});
                    }
                });
            });

        router.route('/changePassword/:user_id')
            .post(tokenMethods.authenticateToken, function(req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                var userID = req.params.user_id;
                var newPassword = req.body.newPassword;
                var oldPassword = req.body.oldPassword;

                if(newPassword == '' || oldPassword == '') {
                    res.status(403).send({message: 'You must fill out all fields'});
                } else {
                    Admin.findOne({_id:userID, token: verifiedToken}, function (err, admin){
                        if(err){res.sendStatus(403)};
                        if(admin != null){
                            //console.log(admin);
                            if(bcrypt.compareSync(oldPassword, admin.password)) {
                                // Passwords match send user the token
                                admin.password = bcrypt.hashSync(newPassword, 10);
                                admin.save();
                                //console.log('user: ', user);
                                res.json({message: 'Successfully changed password. Please wait'});
                            } else {
                                // Passwords don't match
                                // res.status(404).send({message: 'You must enter the correct old password'});
                                if(oldPassword == admin.forgotPass){
                                    admin.password = bcrypt.hashSync(newPassword, 10);
                                    admin.forgotPass = null;
                                    admin.save();
                                    //console.log('user: ', user);
                                    //res.redirect('/logout');
                                    res.json({message: 'Successfully changed password. Please wait'});
                                } else {
                                    res.status(404).send({message: 'You must enter the correct old password'});
                                }
                            }
                        } else {
                            User.findOne({_id:userID, token: verifiedToken}, function (err, user) {
                                if(err) {res.sendStatus(403)};
                                if(user != null) {
                                    //console.log(user);
                                    if(bcrypt.compareSync(oldPassword, user.password)) {
                                        // Passwords match send user the token
                                        user.password = bcrypt.hashSync(newPassword, 10);
                                        user.save();
                                        //console.log('user: ', user);
                                        //res.redirect('/logout');
                                        res.json({message: 'Successfully changed password. Please wait'});
                                    } else {
                                        if(oldPassword == user.forgotPass){
                                            user.password = bcrypt.hashSync(newPassword, 10);
                                            user.forgotPass = null;
                                            user.save();
                                            //console.log('user: ', user);
                                            //res.redirect('/logout');
                                            res.json({message: 'Successfully changed password. Please wait'});
                                        } else {
                                            res.status(404).send({message: 'You must enter the correct old password'});
                                        }
                                        
                                    }
                                } else {
                                    res.sendStatus(403);
                                }
                            });
                        }
                    });
                }
            });
        //
        router.route('/resetPassword')
            .post(function(req, res){
                const nodemailer = require('nodemailer');
                const randomUdidGen = require("../../app/methods/generateUdid");
                const mailController = require('../../app/methods/mailController');

                mailController.init(nodemailer);

                var userEmail = req.body.userEmail;
                var udid = randomUdidGen.gen();
                
                Admin.findOne({username:userEmail}, function(err, admin) {
                    if(err) {res.send(err)};
                    if(admin != null){
                        admin.forgotPass = udid;
                        admin.save();
                        mailController.sendResetPasswordEmail(admin.username, udid);
                        res.json({message: 'We have sent a password reset email.'});
                    } else if(admin == null) {
                        User.findOne({username:userEmail}, function (err, user) {
                            if(err){res.send(err)};
                            if(user != null) {
                                user.forgotPass = udid;
                                user.save();
                                mailController.sendResetPasswordEmail(user.username, udid);
                                res.json({message: 'We have sent a password reset email.'});
                            } else if (user == null) {
                                res.status(403).send({message: 'That does not exist.'});
                            }
                        });
                    }
                });
            });

        router.route('/users/:user_id')
            .delete(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                // check if valid admin token
                Admin.findOne({token: verifiedToken}, function (err, validAdmin ){
                    //console.log('validAdmin: ',validAdmin);
                    if(validAdmin == null) {
                        res.status(404).send({message: 'Only admins can remove users'});
                    } else {
                        User.deleteMany({
                            _id: req.params.user_id
                        }, function (err, data) {
                            console.log(data);
                            if (err || data == undefined) {
                                res.send(err);
                            } else if(data.n == 1) {
                                res.json({ message:'Successfully deleted' });
                            } else if(data.n == 0) {
                                res.status(404).send({message: 'There is no user by that ID'});
                            } else {
                                res.status(404).send({message: 'There is no user by that ID'});
                            }
                        });
                    }
                });
            });
    };
    
    // make this more Accessible 
    function ValidateEmail(mail){
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)){
            return (true);
        } else {
            return (false);
        }
    }
};

var userRoutes = new UserRoutes();
module.exports = userRoutes;