const { toNumber } = require("lodash");

function GarageRouteController() {
    this.init = function init(Garage, Admin, User, router, fs, tokenMethods) {
        router.route('/garage/add')
            .post(tokenMethods.authenticateToken, function (req, res){
                var token = req.headers['authorization'].replace('Bearer ', '');
                var createdBy = req.body.itemCreatedBy;
                var itemTitle = req.body.itemTitle;
                var itemDescription = req.body.itemDescription;
                var itemCategory = req.body.itemCategory;
                var itemQuantity = req.body.itemQuantity;
                var itemPrice = req.body.itemPrice;
                var moment = require('moment');
                var garageItem = new Garage();
                //
                if(!createdBy || !itemTitle || !itemDescription || !itemCategory || !itemQuantity || !itemPrice){
                    res.status(403).send({message:'You must fill in all fields'});
                } else {
                    // Validate price number and quantity
                    if(isNaN(itemPrice) || toNumber(itemPrice) == 0){
                        res.status(403).send({message:'You must add a legit price.'});
                    } else if(isNaN(itemQuantity) || toNumber(itemQuantity) == 0){
                        res.status(403).send({message: 'You must add a legit quantity.'});
                    } else {
                        //res.send({message:'user wishes to add an item'});
                        // Prepare new item
                        //garageItem.

                        // Check for user existence
                        Admin.findOne({_id: createdBy, token: token}, function (err, admin) {
                            if(err) {
                                res.send(err);
                            } else if(admin != null){
                                //console.log(admin);
                                addNewItem(garageItem, res);
                            } else if(admin == null){
                                User.findOne({_id:createdBy, token: token}, function (err, user) {
                                    if(err){
                                        res.send(err);
                                    } else if(user != null) {
                                       // console.log(user);
                                        addNewItem(garageItem, res);
                                    } else {
                                        res.sendStatus(403);
                                    }
                                });
                            }
                        });
                    }

                    function addNewItem(garageItem, response) {
                        //console.log('Add new garage item: ', garageItem);
                        garageItem.createdBy = createdBy;
                        garageItem.date = moment().format();
                        garageItem.rating = null;
                        garageItem.comments = [];
                        garageItem.price = itemPrice;
                        garageItem.isSold = false;
                        garageItem.isAvailable = true;
                        garageItem.quantity = itemQuantity;
                        garageItem.title = itemTitle;
                        garageItem.description = itemDescription;
                        garageItem.category = itemCategory;
                        garageItem.save(function (err) {
                            if(err){
                                response.send(err)
                            } else{
                                response.send({message:'Successfully added new item!'});
                            }
                        });
                    };
                    
                }
            });
            
        // Get all garage items ever posted.
        router.route('/garage/items')
            .get(tokenMethods.authenticateToken, function (req, res){
                var token = req.headers['authorization'].replace('Bearer ', '');
                // Only admins can see ALL garage items. Look for user specific garage routes.
                Admin.findOne({token:token}, function (err, admin){
                    if(err){
                        res.send(err);
                    } else if(admin != null){
                        Garage.find(function (err, gItems){
                            if(err){
                                res.send(err);
                            } else {
                                res.send(gItems);
                            }
                        });
                    } else{
                        res.sendStatus(403);
                    }
                });
                
            });

        // Delete garage item only if you are the owner of that item.
        router.route('/garage/item/:item_id')
            .get(tokenMethods.authenticateToken, function (req, res) {
                Garage.findOne({
                    _id: req.params.item_id
                }, function (err, item){
                    if(err){
                        res.send(err);
                    } else if(item != null){
                        res.send(item);
                    } else {
                        res.sendStatus(403);
                    }
                })
            })
            .delete(tokenMethods.authenticateToken, function(req, res) {
                var token = req.headers['authorization'].replace('Bearer ', '');
                Admin.findOne({token:token}, function (err, admin) {
                    if(err){
                        res.send(err);
                    } else if(admin != null){
                        deleteItem(admin._id);
                    } else if(admin == null) {
                        User.findOne({token: token}, function (err, user){
                            if(err){
                                res.send(err);
                            } else if(user != null) {
                                deleteItem(user._id);
                            } else {
                                res.status(403).send({message: 'You must be the creator of this item'});
                            }
                        });
                    }
                });

                function deleteItem(forUser){
                    Garage.deleteOne({
                        _id: req.params.item_id,
                        createdBy: forUser
                    }, function (err, msg) {
                        if (err) {
                            res.status(403).send({message:'There is no item by that ID'})
                        } else {
                            // console.log(msg);
                            if(msg.n == 0){
                                res.status(403).send({message:'There is no item by that ID'})
                            } else if(msg.n == 1){
                                res.json({ message:'Successfully deleted:'});
                            }
                            
                        }
                    });
                }
                
            });
    };
};
var garageRouteController = new GarageRouteController();
module.exports = garageRouteController;