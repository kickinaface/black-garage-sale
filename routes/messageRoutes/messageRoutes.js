const mailController = require('../../app/methods/mailController');
//
function MessageRoutes() {
    this.init = function init(msgModel, router, tokenMethods, Admin, User) {
        var moment = require('moment');
        //get messages
        router.route('/messages')
            .post(tokenMethods.authenticateToken, function (req, res) {
                var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                var mModel = new msgModel();	//create a new instance of the ncMsg model
                var toUserKey = req.body.toUser;
                var fromUserKey = req.body.fromUser;
                var messageKey = req.body.message;
                var fromUserId = req.body.fromAvatarId;
                //
                if(!toUserKey || !fromUserKey || !messageKey || !fromUserId) {
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
                                sendMessage(fromUserId);
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
                                        sendMessage(fromUserId);
                                    }
                                } else {
                                    res.sendStatus(403);
                                }
                            });
                        }
                    });
                    function sendMessage(fromUserId){
                        Admin.findOne({username: toUserKey}, function (err, admin) {
                            if(err){
                                res.send(err);
                            } else {
                                if(admin != null) {
                                    // its this user
                                    mModel.toUser = toUserKey;	//set the ncMsgs name (comes from the request)
                                    mModel.fromUser = fromUserKey;
                                    mModel.message = messageKey;
                                    mModel.date = moment().format();
                                    mModel.fromAvatarId = fromUserId;
                                    
                                    //save the message and check for errors
                                    mModel.save(function (err) {
                                        if (err){
                                            res.send(err);
                                        } else {
                                            // Check if user enabled email notifications/
                                            if(admin.emailMessages == true){
                                                var preparedMessage = ('<strong>From: '+ fromUserKey+ '</strong><br/>'+messageKey);
                                                mailController.sendEmailFromMessages(toUserKey, preparedMessage);
                                            }
                                            res.json({ message: 'Message Created!' });
                                        }
                                    });
                                } else {
                                    // try user table
                                    User.findOne({username: toUserKey}, function (err, user) {
                                        if(err){
                                            res.send(err);
                                        } else {
                                            if(user != null) {
                                                mModel.toUser = toUserKey;	//set the ncMsgs name (comes from the request)
                                                mModel.fromUser = fromUserKey;
                                                mModel.message = messageKey;
                                                mModel.date = moment().format();
                                                mModel.fromAvatarId = fromUserId;

                                                //save the message and check for errors
                                                mModel.save(function (err) {
                                                    if (err){
                                                        res.send(err);
                                                    } else {
                                                        if(user.emailMessages == true){
                                                            var preparedMessage = ('<strong>From: '+ fromUserKey+ '</strong><br/>'+messageKey);
                                                            mailController.sendEmailFromMessages(toUserKey, preparedMessage);
                                                        }
                                                        res.json({ message: 'Message Created!' });
                                                    }
                                                });
                                            } else {
                                                // There is no user by this ID to send a message to
                                                res.send(err);
                                            }
                                        }
                                    });
                                }
                            }
                        });

                        
                    }
                }
            })
            //get all the messages
            /// change comment style layout
            .get(tokenMethods.authenticateToken, function (req, res) {
                Admin.findOne({token: req.cookies.bCookieToken}, function (err, admin){
                    if(err){
                        res.send(err);
                    } else if(admin != null){
                        msgModel.find(function (err, msgs) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json(msgs);
                            }
                        });
                    } else if (admin == null){
                        res.status(403).send({message: 'Only Admins'});
                    }
                });
            });
            //Get individual messages by id
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
            // .put(tokenMethods.authenticateToken, function (req, res) {
            //     msgModel.findById(req.params.msg_id, function (err, msg) {
            //         if (err) {
            //             res.send(err);
            //         } else {
            //             msg.message = req.body.message;
            //             msg.save(function (err) {
            //                 if (err) {
            //                     res.send(err);
            //                 } else {
            //                     res.json({ message: 'message Updated!' })
            //                 }
            //             });
            //         }
            //     });
            // })

            // .delete(tokenMethods.authenticateToken, function (req, res) {
            //     msgModel.remove({
            //         _id: req.params.msg_id
            //     }, function (err, msg) {
            //         if (err) {
            //             res.send(err);
            //         }
            //         res.json({ message:'Successfully deleted:'});
            //     });
            // });
        
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
                                // Sort by most recent date
                                var newMessages = _.sortBy(preparedMessages, function(m){
                                    return new moment(m.date);
                                }).reverse();

                                // Create new Object that is grouped by fromUser
                                var groupedMessages = _.groupBy(newMessages, function(m){
                                    return m.fromUser;
                                });
                                //
                                res.send(groupedMessages);
                            }
                        });
                    }
               
                });

            router.route('/messages/conversation/delete/:userEmail')
                .delete(tokenMethods.authenticateToken, function (req, res){
                    var verifiedToken = req.headers['authorization'].replace('Bearer ', '');
                    var userToDelete = req.params.userEmail;
                    //var messageModel = new msgModel();
                    //
                    User.findOne({token:verifiedToken}, function (err, user){
                        if(err){
                            console.log(err);
                            res.send(err)
                        } else if(user != null){
                            findAndDeleteConversation(userToDelete, user.username);
                        } else if(user == null){
                            Admin.findOne({token: verifiedToken}, function (err, admin){
                                if(err){
                                    console.log(err);
                                    res.send(err);
                                } else if(admin != null){
                                    console.log('found admin user: email');
                                    findAndDeleteConversation(userToDelete, admin.username);
                                } else {
                                    res.send(403);
                                }
                            });
                        }
                    });

                    function findAndDeleteConversation(userToDelete, tokenUsersEmail){
                        // Find all FROM messages and DELETE
                        msgModel.deleteMany({fromUser: userToDelete, toUser: tokenUsersEmail}, function (err, fromMsg){
                            if(err){
                                console.log(err);
                            } else if(fromMsg.n == 1){
                                console.log('deleted FROM');
                            }
                        });
                        // Find all TO messages and DELETE
                        msgModel.deleteMany({toUser: userToDelete, fromUser:tokenUsersEmail}, function (err, toMsg){
                            if(err){
                                console.log(err);
                            } else if(toMsg.n == 1){
                                console.log('Deleted TO');
                            }
                        });
                        //
                        res.send({message:'This conversation has been deleted'})
                    };
                    
            });
    };
};

var messageRoutes = new MessageRoutes();
module.exports = messageRoutes;