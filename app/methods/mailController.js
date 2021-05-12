const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const CLIENT_ID = '597267224495-mid42fv2dfe99qmer5aavtf21tbp3jjl.apps.googleusercontent.com';
const CLIENT_SECRET = 'NiDcEXRGjYalmFWKj9QIczm0';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04RSuxJFnKP4wCgYIARAAGAQSNwF-L9IrE1xa3JeFqjJnCJbz08gx0wYNPEOmMLbEeYHKdSTtWjgniqwf-y8tXV0uDOvIJz9AISc';
//
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
var accessToken;
oAuth2Client.getAccessToken().then(function (value){
    accessToken = value;
}).catch(function (err){
    //console.log(err);
})
//
const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth: {
        type: 'OAuth2',
        user: 'blackgaragesale@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
    }
    // auth: {
    //     user: 'blackgaragesale@gmail.com',
    //     pass: process.env.EMAIL_PASS
    // }
});
//
function MailController() {
    this.sendResetPasswordEmail = function sendResetPasswordEmail(toEmail, udid){
        var mailOptions = {
            from: 'blackgaragesale@gmail.com',
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
            from: 'blackgaragesale@gmail.com',
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
            from: 'blackgaragesale@gmail.com',
            to: toEmail,
            subject: 'New Message: Black Garage Sale <Do Not Reply>',
            html: (message + '<br/><a href="https://www.blackgaragesale.com/messages">Login</a> to view Messages')
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
            from: 'blackgaragesale@gmail.com',
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