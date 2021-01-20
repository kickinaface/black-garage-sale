function MailController() {
    var _this = this;
    this.init = function(nodemailer){
        _this.nodemailer = nodemailer;
    }
    this.sendResetPasswordEmail = function(toEmail, udid){
        var transporter = _this.nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        //var formmattedUrl = ('http://localhost:3000/api/resetPassword/'+(toEmail)+'/'+udid+'/');
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Reset Password: Black Garage Sale <Do Not Reply>',
            html:"Here is your temporary password: <br><br><b>"+udid+"</b> <br><br>Please sign in with it immediately. If this wasn't you, please contact your Administrator"
        };
        
        return transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });


    //     console.log('send reset password email ', toEmail);
    //     console.log(_this.nodemailer);
    }
}

var mailController = new MailController();
module.exports = mailController;