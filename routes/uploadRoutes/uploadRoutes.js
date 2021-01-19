function UploadRoutes(){
    this.init = function init(Admin, User, router, fs, tokenMethods) {
        //file upload routes turn into controllers later
        router.route("/uploadAvatar")
            .post(function(req, res) {
                var userID = null;

                if (!req.files || Object.keys(req.files).length === 0) {
                    return res.status(400).send('No files were uploaded.');
                }
                //The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
                let avatarImage = req.files.avatarImage;

                searchToken(req.body.avatarUploadUserToken, function (data, u) {
                    if(data == true){
                        userID = u._id;
                        var imagePath = ('./avatar/'+userID+'/avatarImage.jpg');
                        //console.log('imagePath: ', imagePath)
                        if(fs.existsSync(imagePath)) {
                            //console.log('path exists');
                            avatarImage.mv(imagePath, function(err) {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                   // console.log('succesfully updated');
                                    res.redirect('/profile');
                                    //res.send('File uploaded!');
                                }
                            });
                        } else {
                           // console.log('path does not exist');
                            fs.mkdir("./avatar/"+userID, function (err) {
                                if (err) {
                                    res.status(500).send(err);
                                } else {
                                    avatarImage.mv(imagePath, function(err) {
                                        if (err) {
                                            return res.status(500).send(err);
                                        } else {
                                            res.redirect('/profile');
                                            //res.send('File uploaded!');
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        res.redirect('/login');
                    }
                });
            });
     
            function searchToken(inputToken, callback){
                if(tokenMethods.verifyToken(inputToken)){
                    Admin.findOne({token: inputToken}, function (err, admin){
                        if(admin) {
                            callback(true, admin);
                            //res.sendFile(path.join(__dirname+'/public/profile.html'));
                        } else {
                            //callback(false);
                            User.findOne({token: inputToken}, function (err, user) {
                                if(user) {
                                    callback(true, user);
                                    //res.sendFile(path.join(__dirname+'/public/profile.html'));
                                } else {
                                    callback(false);
                                    //res.sendStatus(403);
                                }
                            });
                        }
                    });
                } else {
                    callback(false);
                }
                
            };
    };
};

var uploadRoutes = new UploadRoutes();
module.exports = uploadRoutes;