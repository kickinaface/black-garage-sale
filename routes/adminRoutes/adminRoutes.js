function AdminRoutes() {
    this.init = function init(Admin, User, router, tokenMethods) {
        const bcrypt = require('bcrypt');
        router.route('/admin')
            .post(tokenMethods.authenticateToken, function (req, res) {
                var admin = new Admin();
                var username = req.body.username;
                var password = req.body.password;
                var alreadyExistMessage = 'This user already exists, please sign in.';

                if (username === undefined || password === undefined || username === '' || password === '') {
                    res.json({ message: 'ERROR: You must define a username and password'});
                }else if(ValidateEmail(username) == false){
                    res.json({ message: 'ERROR: You must enter a valid email address'});
                } else {
                    User.findOne({username:username}, function (err, user) {
                        if(user == null) {
                            //no user found, create admin
                            // Look for a user by the posted username, if it doesn't exist, add new user
                            // Otherwise, do not allow user to add the same username.
                            Admin.findOne({username:username}, function(err, administrator) {
                                //console.log(administrator);
                                if (administrator == null) {
                                    // Add user
                                    admin.username = username;
                                    admin.password = bcrypt.hashSync(password, 10);
                                    admin.role = 'admin';
                                    //
                                    admin.save(function (err) {
                                        if (err){
                                            res.send(err);
                                        } else {
                                            console.log('Created new administrator');
                                            res.json({ message: 'Admin Created!' });
                                        }
                                    });
                                } else if(administrator.username == username) {
                                    //console.log('found user already: ', administrator);
                                    res.status(404).send({message: alreadyExistMessage});
                                }
                            });
                        } else {
                            // user found do not create another one.
                            res.status(403).send({message: alreadyExistMessage});
                        }
                    });
                   
                }
            })
            .get(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                Admin.findOne({username:req.query.username, token:verifiedToken}, function(err, administrator) {
                    if (administrator == null) {
                        res.status(404).send({message: 'Only administrators can view'});
                    } else {
                        Admin.find(function (err, admins) {
                            if (err) {
                                res.send(err);
                            } else {
                                var adminsList = [];
                                for(var a = 0; a<=admins.length-1; a++){
                                    var adminObject = {
                                        _id: admins[a]._id,
                                        username: admins[a].username,
                                        role: admins[a].role,
                                        //userAgent: admins[a].userAgent,
                                        //clientIpAddress: admins[a].clientIpAddress
                                        //token: admins[a].token
                                    }
                                    adminsList.push(adminObject);
                                }
                                res.json(adminsList);
                            }
                        });
                    }
                });
            });

        //Remove the administrator by id
        router.route('/admin/:admin_id')
            .delete(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                // check if valid admin token
                Admin.findOne({token: verifiedToken}, function (err, validAdmin){
                    if(err) {
                        res.send(err)
                    } else {
                        if(validAdmin == null){
                            res.status(404).send({message: 'Only admins can remove users'});
                        } else {
                            Admin.remove({
                                _id: req.params.admin_id
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
var adminRoutes = new AdminRoutes();
module.exports = adminRoutes;