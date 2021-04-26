const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
//
function MailController() {
    this.sendResetPasswordEmail = function sendResetPasswordEmail(toEmail, udid){
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Reset Password: Black Garage Sale <Do Not Reply>',
            html:"Here is your temporary password: <br><br><b>"+udid+"</b> <br><br>Please sign in with it immediately and CHANGE YOUR PASSWORD!"+
            " If this wasn't you, please contact your Administrator"
        };
        
        transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log(data.response);
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
        
        transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log(data.response);
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
        
        transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log(data.response);
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
        
        transporter.sendMail(mailOptions, function (err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log(data.response);
            }
        });
    }; 
};

var mailController = new MailController();
module.exports = mailController;