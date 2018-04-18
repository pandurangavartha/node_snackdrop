/**
 * @desc Email sending module with google smtp or aws-ses
 * @type Module nodemailer|Module nodemailer
 * @type Module q|Module q promise module
 * @author Darshna Joshi<217>
 * @date 30 JUNE 2017
 */

var nodemailer = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
var Q = require('q');

var mailHelper = {};
/**
 * Gmail SMTP configuration object
 */
mailHelper.gmailConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: (process.env.MAIL_ENCRYPTION == 'ssl' ) ? true : false, // use SSL
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
};
/**
 * AWS configuration object
 */
mailHelper.awsConfig = {
    transport: 'ses', // loads nodemailer-ses-transport
    accessKeyId:  process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
};
/**
 * Send Email 
 * @param array toEmails Array of to email ids
 * @param string emailBody simple text string or html string
 * @param string subject
 * @param array ccEmails Array of cc email ids
 * @param array bccEmails Array of bcc email ids
 * @param array attachments Array of attachment obectes
 * @returns {Q@call;defer.promise} success or fail
 * @author Darshna Joshi<217>
 */
mailHelper.sendEmail = function (toEmails, emailBody, subject, ccEmails, bccEmails, attachments) {

    //Get Mail provide from env file
    var mailProvider = process.env.MAIL_PROVIDER;
    //Get From name for sender
    var fromName = process.env.MAIL_FROM_NAME;    
    var deferred = Q.defer();
    
    //If mail provider = gmail then Use gmail configuration
    if (mailProvider == 'gmail') {        
        //From Email id of gmail smtp : sender email
        var sourceEmail = process.env.MAIL_FROM;
        //Create transporter using gmail configuration 
        var transporter = nodemailer.createTransport(smtp(mailHelper.gmailConfig));      
    }
    //Use aws ses configuration
    else {
        //From Email id of ses : sender email
        var sourceEmail = process.env.SES_FROM_EMAIL;
        //Create transporter using aws configuration
        var transporter = nodemailer.createTransport(ses(mailHelper.awsConfig));
    }
    //Set mail options
    var mailOptions = {
        from : '"'+ fromName + '"<' + sourceEmail + '>',
        to   : toEmails,
        cc   : ccEmails,
        bcc  : bccEmails,
        subject: subject,
        text : emailBody,
        html : emailBody,
        attachments : attachments
    };
    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function (error, info) {
     if (error) {
            deferred.reject({status: false,'error':error});
        } else {
            deferred.resolve({status: true, 'info':info});
        }
    });
    //return result
    return deferred.promise;
}

module.exports = mailHelper;