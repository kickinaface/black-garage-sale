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
                                            console.log('Created new User. Please log in.');
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