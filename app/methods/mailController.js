function MailController() {
    var _this = this;
    var transporter;

    this.init = function(nodemailer){
        _this.nodemailer = nodemailer;
        transporter = _this.nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    this.sendResetPasswordEmail = function sendResetPasswordEmail(toEmail, udid){
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Reset Password: Black Garage Sale <Do Not Reply>',
            html:"Here is your temporary password: <br><br><b>"+udid+"</b> <br><br>Please sign in with it immediately and CHANGE YOUR PASSWORD!"+
            " If this wasn't you, please contact your Administrator"
        };
        
        return transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });

    };

    this.passwordHasBeenReset = function passwordHasBeenReset(toEmail){
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Changed Password: Black Garage Sale <Do Not Reply>',
            html:"This email is to confirm that your password has been reset."+
            " If this wasn't you, please contact your Administrator"
        };
        
        return transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });
    };

    this.sendEmailFromMessages = function sendEmailFromMessages(toEmail, message){
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'New Message: Black Garage Sale <Do Not Reply>',
            html:message
        };
        
        return transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });
    }

    this.sendNewAccountEmail = function sendNewAccountEmail(toEmail){
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Welcome: Black Garage Sale <Do Not Reply>',
            html:"Welcome to Black Garage Sale! Thank you for registering with us."
        };
        
        return transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                return false;
            } else {
                return true;
            }
        });
    }; 
};

var mailController = new MailController();
module.exports = mailController;