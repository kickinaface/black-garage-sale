function SearchRouteController() {
    this.init = function init(router, tokenMethods, Admin, User, Garage) {
        router.route('/search')
            .get(tokenMethods.authenticateToken, function (req, res){
                var toSearchFor = req.query.lookingFor;
                var searchType = req.query.searchType;

                if(!toSearchFor || !searchType){
                    res.status(403).send({message:'You must not leave any fields blank'});
                } else {
                    if(searchType == 'item'){
                        Garage.find({$text: {$search: toSearchFor}})
                        .limit(10)
                        .exec(function (err, docs){
                            if(err){
                                res.send(err);
                            } else {
                                res.send(docs);
                            }
                        });
                    } else if(searchType == 'user'){
                        var foundUsers = [];
                        Admin.find({$text: {$search: toSearchFor}})
                            .limit(1)
                            .exec(function (err, docs){
                                if(err){
                                    res.send(err);
                                } else {
                                    
                                    for(var a = 0; a <= docs.length-1; a++){
                                        var modifiedResult = {
                                            username: docs[a].username,
                                            role: docs[a].role,
                                            firstName:docs[a].firstName,
                                            lastName:docs[a].lastName
                                        }
                                        foundUsers.push(modifiedResult);
                                    }
                                }
                            });
                        User.find({$text: {$search: toSearchFor}})
                            .limit(10)
                            .exec(function (err, udocs){
                                if(err){
                                    res.send(err);
                                } else {

                                    for(var u = 0; u <= udocs.length-1; u++){
                                        var modifiedResult = {
                                            username: udocs[u].username,
                                            role: udocs[u].role,
                                            firstName:udocs[u].firstName,
                                            lastName:udocs[u].lastName
                                        }
                                        foundUsers.push(modifiedResult);
                                    }
                                }
                                res.send(foundUsers);
                            });
                    } else {
                        res.sendStatus(403);
                    }
                    
                }
                
            });
    };
};

var searchRouteController = new SearchRouteController();

module.exports = searchRouteController;