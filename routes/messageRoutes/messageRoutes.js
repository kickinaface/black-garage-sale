function MessageRoutes() {
    this.init = function init(msgModel, router) {
        //get messages
        router.route('/messages')
            .post(function (req, res) {
                var mModel = new msgModel();	//create a new instance of the ncMsg model
                mModel.username = req.body.username;	//set the ncMsgs name (comes from the request)
                mModel.message = req.body.message;

                //save the ncMsg and check for errors
                mModel.save(function (err) {
                    if (err){
                        res.send(err);
                    } else {
                        res.json({ message: 'Message Created!' });
                    }
                });

            })
            //get all the ncMsgs (accessed at GET http://localhost:8080/api/ncMsgs)
            .get(function (req, res) {
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
            .get(function (req, res) {
                msgModel.findById(req.params.msg_id, function (err, msg) {
                    if (err){
                        res.send(err);
                    } else {
                        res.json(msg);
                    }
                });
            })
            //update the ncMsg with this id
            .put(function (req, res) {
                msgModel.findById(req.params.msg_id, function (err, msg) {
                    if (err) {
                        res.send(err);
                    } else {
                        msgModel.username = req.body.username;
                        msgModel.message = req.body.message;

                        msgModel.save(function (err) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json({ message: 'message Updated!' })
                            }
                        });
                    }
                });
            })

            .delete(function (req, res) {
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