function MessageRoutes() {
    this.init = function init(msgModel, router, tokenMethods, Admin, User) {
        //get messages
        router.route('/messages')
            .post(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                var mModel = new msgModel();	//create a new instance of the ncMsg model
                var toUserKey = req.body.toUser;
                var fromUserKey = req.body.fromUser;
                var messageKey = req.body.message;
                var moment = require('moment');
                //console.log(moment().format());
                if(!toUserKey || !fromUserKey || !messageKey) {
                    res.status(404).send({message:'You must fill in all fields. '});
                } else {
                    Admin.findOne({token:verifiedToken, username:fromUserKey}, function (err, admin) {
                        if(err) {res.send(err)};
                        if(admin != null){
                            //console.log('admin: ', admin);
                            if(toUserKey == admin.username){
                                //res.sendStatus(403);
                                res.status(403).send({message: 'You cant send a message to yourself.'});
                            } else if(fromUserKey != admin.username){
                                res.sendStatus(403);
                            } else {
                                //res.json({message:'send a message to: ', toUserKey});
                                sendMessage();
                            }
                        } else if(admin == null) {
                            User.findOne({token:verifiedToken, username:fromUserKey}, function(err, user) {
                                if(err) {res.send(err)};
                                if(user != null){
                                    //console.log('user: ', user);
                                    if(toUserKey == user.username){
                                        //res.sendStatus(403);
                                        res.status(403).send({message: 'You cant send a message to yourself.'});
                                    } else if(fromUserKey != user.username){
                                        res.sendStatus(403);
                                    } else {
                                        //res.json({message:'send a message to: ', toUserKey});
                                        sendMessage();
                                    }
                                } else {
                                    res.sendStatus(403);
                                }
                            });
                        }
                    });
                    function sendMessage(){
                        mModel.toUser = toUserKey;	//set the ncMsgs name (comes from the request)
                        mModel.fromUser = fromUserKey;
                        mModel.message = messageKey;
                        mModel.date = moment().format();

                        // CHANGE SOON! AS LAST STEP CHECK FOR ROGUE EMAIL ADDRESSES TO FALSE USERS
                        //save the ncMsg and check for errors
                        mModel.save(function (err) {
                            if (err){
                                res.send(err);
                            } else {
                                res.json({ message: 'Message Created!' });
                            }
                        });
                    }
                }
            })
            //get all the messages (accessed at GET http://localhost:8080/api/ncMsgs)
            /// change comment style layout
            .get(tokenMethods.authenticateToken, function (req, res) {
                msgModel.find(function (err, msgs) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(msgs);
                    }
                });
            });
            //on routes that end in /ncMsgs/:ncMsg_id
            //-----------------------------------------------------
        router.route('/messages/:msg_id')
            //get the ncMsg with that id
            .get(tokenMethods.authenticateToken, function (req, res) {
                msgModel.findById(req.params.msg_id, function (err, msg) {
                    if (err){
                        res.send(err);
                    } else {
                        res.json(msg);
                    }
                });
            })
            //update the ncMsg with this id
            .put(tokenMethods.authenticateToken, function (req, res) {
                msgModel.findById(req.params.msg_id, function (err, msg) {
                    if (err) {
                        res.send(err);
                    } else {
                        msg.message = req.body.message;
                        msg.save(function (err) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json({ message: 'message Updated!' })
                            }
                        });
                    }
                });
            })

            .delete(tokenMethods.authenticateToken, function (req, res) {
                msgModel.remove({
                    _id: req.params.msg_id
                }, function (err, msg) {
                    if (err) {
                        res.send(err);
                    }
                    res.json({ message:'Successfully deleted:'});
                });
            });
        
            router.route('/messages/forUser/:userId')
                .get(tokenMethods.authenticateToken, function (req, res) {
                    var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                    var userId = req.params.userId;
                    Admin.findOne({_id:userId, token: verifiedToken}, function (err, admin){
                        if(err) {
                            res.status(403).send({message:'No such ID'})
                        } else {
                            if(admin != null) {
                                //res.json({message:'User wishes to find mesages for admin'});
                                findAllMessagesForUser(admin);
                            } else if(admin == null){
                                User.findOne({_id:userId, token: verifiedToken}, function(err, user){
                                    if(err) {res.send(err)};
                                    if(user != null){
                                        //res.json({message:'User wishes to find mesages for user'});
                                        findAllMessagesForUser(user);
                                    } else {
                                        res.sendStatus(403);
                                    }
                                });
                            }
                        }
                        
                    });
                    function findAllMessagesForUser(u){
                        var preparedMessages = [];
                        var _ = require('lodash');

                        msgModel.find(function (err, msgs) {
                            if (err) {
                                res.send(err);
                            } else {
                                // Loop through all messages and place all associated messages together by user
                                for(var m = 0; m<= msgs.length-1; m++){
                                    // Put all messages with users name both to and from in array
                                    if(msgs[m].toUser == u.username || msgs[m].fromUser == u.username){
                                        preparedMessages.push(msgs[m]);
                                    }
                                }
                                // Create new Object that is grouped by fromUser
                                var groupedMessages = _.groupBy(preparedMessages, function(m){
                                    return m.fromUser;
                                });

                                res.send(groupedMessages);
                            }
                        });
                    }
               
                });
    };
};

var messageRoutes = new MessageRoutes();
module.exports = messageRoutes;