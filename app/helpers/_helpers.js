/*
 *  providing the helper functions
 */
module.exports = {
    /*
     * Helper function to format all error and success response to maintain common format
     * return json output
     */

    formatResponse: function(response, res, error) {
        var httpstatus = 200;
        if (typeof response.httpstatus != 'undefined' && response.httpstatus != '') {
            var httpstatus = response.httpstatus;
        }
        if (httpstatus != 200 && process.env.WINSON_ERROR_LOG == true) {
            winston.log('error', response);
        }
        var output = {};
        if (response !== '') {
            var successStatus = true;
            output['success'] = successStatus;
            if (typeof response.msg != 'undefined' && response.msg != '') {
                var responseMessage = response.msg;
                output['error'] = responseMessage;
            }
            if (typeof response.result != 'undefined' && response.result != '') {
                var responseData = response.result;
                output['result'] = responseData;
            }
        } else {
            var successStatus = false;

            if (typeof error.httpstatus != 'undefined' && error.httpstatus != '') {
                var httpstatus = error.httpstatus;
                delete error.httpstatus;
            } else {
                var httpstatus = helper.getHttpStatusFromMongooseError(error.code);
            }
            output = {
                success: successStatus,
                error: error.msg,
            }
        }
        res.status(httpstatus).json(output)
    },
    /*
     * Helper function to validate all required parameters.
     * return ===> error = httpstatus 422, success = true.
     */

    validateRequiredParams: function(req, res, requiredParams) {
        return new Promise(function(resolve, reject) {
            var errorCount = 0;
            var missingParams = [];
            var errorMsg = [];
            requiredParams.forEach(function(obj) {
                if (typeof req.body[obj] == 'undefined' || req.body[obj] == '') {
                    errorCount++;
                    missingParams.push(obj);
                    errorMsg.push(obj + ' is required.');
                }
            });
            if (errorCount > 0) {
                var error = {
                    success: false,
                    httpstatus: 422,
                    error : "Missing required parameters",
//                    message : 'Missing required parameters',
//                    data: {
//                        missingParams: missingParams
//                    }
                };
                //helper.formatResponse(error, res);
                res.status(422).json(error);
            } else {
                resolve({
                    success: true,
                    data: []
                });
            }

        })
    },
    getHttpStatusFromMongooseError: function(errorCode) {
        var codeLibrary = {};
        var code = '';
        codeLibrary = {
            '11000': 409
        };
        if ((typeof codeLibrary[errorCode] != 'undefined') && codeLibrary[errorCode] != '') {
            code = codeLibrary[errorCode];
        } else {
            code = 400; // default
        }
        return code;
    },

    /*
     * Helper function to parse unique field name from moongose error syntex.
     * return ===> error = httpstatus 422, success = true.
     */

    parseUniqueFieldError: function(errorCode) {
        var field = errorCode.message.split('index: ')[1];
        // now we have `keyname_1 dup key`
        field = field.split(' dup key')[0];
        field = field.substring(0, field.lastIndexOf('_')); // returns keyname
        return field;
    },
    /**
     * @method generateRandomString
     * @description To generate randem string
     * @param {type} len
     * @returns random string
     */
    generateRandomString: function (len) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var token = '';
        for (var i = len; i > 0; --i) {
            token += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return token;
    },
    /**
     * @method sendEmail
     * @description send email to specified EmailId
     * @param {type} errorsIn
     * @returns {}
     */    
    sendEmail: function (subject, to, content, fromTitle, replyTo) {        
        mailHelper.sendEmail(to, content, subject, cc=[], bcc=[], attachments=[])
        .then(function(response) {        
            return response;
        },function(error){
            return error;
        });
    },
}