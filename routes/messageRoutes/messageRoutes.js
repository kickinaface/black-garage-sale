function MessageRoutes() {
    this.init = function init(msgModel, router, tokenMethods) {
        //get messages
        router.route('/messages')
            .post(tokenMethods.authenticateToken, function (req, res) {
                var mModel = new msgModel();	//create a new instance of the ncMsg model
                var toUserKey = req.body.toUser;
                var fromUserKey = req.body.fromUser;
                var messageKey = req.body.message;

                if(!toUserKey || !fromUserKey || !messageKey) {
                    res.status(404).send({message:'You must fill in all fields. '});
                } else {
                    mModel.toUser = toUserKey;	//set the ncMsgs name (comes from the request)
                    mModel.fromUser = fromUserKey;
                    mModel.message = messageKey;

                    //save the ncMsg and check for errors
                    mModel.save(function (err) {
                        if (err){
                            res.send(err);
                        } else {
                            res.json({ message: 'Message Created!' });
                        }
                    });
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
    };
};

var messageRoutes = new MessageRoutes();
module.exports = messageRoutes;