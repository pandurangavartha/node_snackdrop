var swig = require('swig');
var jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");

module.exports = {
    /**
     * @desc Register user with 
     * email : email id
     * name : full name
     * dob : date of birth
     * password : password
     * mobile : mobile number
     * facebookId : fb id if resigter by fb
     * dtId : 2 :Android, 3: iOS 
     * deviceToken : device token
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    registerUser: function (req, res) {
        var postData = req.body;

        var requiredParams = ['email', 'name', 'dob', 'mobile', 'dtId', 'deviceToken'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var userData = {email: postData.email, name: postData.name, roleId: 3};
            if (postData.password != '') {
                userData.password = bcrypt.hashSync(req.body.password);
            }
            //check data is exist or not
            models.users.findOne({
                where: {email: postData.email, roleId: 4},
                include: [{
                        model: models.customerdetails
                }]
            }).then(function (guest) {
                if (typeof guest != 'undefined' && guest != '' && guest != null) {
                    //if as guest user exist then make it normal user
                    guest.name = postData.name;
                    guest.password = bcrypt.hashSync(req.body.password);
                    guest.roleId = 3;
                    guest.save({individualHooks: true}).then(function (user) {
                        //Update customer details
                        isSaved = guest.customerdetail.updateAttributes({
                            dob: postData.dob,
                            mobile: postData.mobile,
                            dtId: postData.dtId,
                            deviceToken: postData.deviceToken
                        });
                        var resData = {dob: guest.customerdetail.dob, mobile: guest.customerdetail.mobile, userId: user.id,
                            email: user.email, name: user.name, roleId: 4, isGuest: 1};
                        var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                        res.setHeader('x-access-token', token);
                        var response = [];
                        response.result = resData;
                        helper.formatResponse(response, res, '');
                    }).catch(function (error) {
                        res.status(400).json({
                            status: false,
                            error: error
                        });
                    });
                } else {
                    //Add data to users
                    models.users.create(userData).then(function (data) {
                        //add customer details
                        var customerData = {dob: postData.dob, mobile: postData.mobile, dtId: postData.dtId,
                            deviceToken: postData.deviceToken, userId: data.id};

                        if (postData.facebookId != '') {
                            customerData.facebookId = postData.facebookId;
                        }
                        models.customerdetails.create(customerData).then(function (customer) {
                            var resData = {dob: customer.dob, mobile: customer.mobile, userId: data.id, email: data.email, name: data.name};
                            //JWT token generation
                            var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                            res.setHeader('x-access-token', token);
                            var response = [];
                            response.result = resData;
                            helper.formatResponse(response, res, '');

                        }).catch(function (err) {
                            res.status(400).json({
                                status: false,
                                error: err
                            });
                        });
                    }).catch(Sequelize.ValidationError, function (err) {
                        return res.status(422).json({
                            status: false,
                            error: err.errors[0].message
                        });
                    }).catch(function (err) {
                        res.status(400).json({
                            status: false,
                            error: err.message
                        });
                    });
                }
            }).catch(function (error) {
                res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
        });
    },
    /**
     * @desc social Login with FB Id
     * Facebook id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    socialLogin: function (req, res) {
        var requiredParams = ['facebookId', 'dtId', 'deviceToken'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var fbId = req.body.facebookId;
            models.customerdetails.findOne({where: {facebookId: fbId},
                include: [{
                        model: models.users
                    }]
            }).then(function (data) {

                if (data !== null) {
                      isSaved = data.updateAttributes({
                                 dtId: req.body.dtId,
                                deviceToken: req.body.deviceToken
                            });
                    var resData = {dob: data.dob, mobile: data.mobile, userId: data.user.id, email: data.user.email, name: data.user.name};
                    //LOGIN
                    //JWT token generation
                    var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                    res.setHeader('x-access-token', token);
                    var response = [];
                    response.result = resData;
                    helper.formatResponse(response, res, '');
                } else {
                    return res.status(404).send({
                        status: false,
                        error: appMessage.user.customer.error.dataNotFound
                    });
                }
            }).catch(function (error) {
                res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
        });
    },
    /**
     * @desc Get user profile details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProfile: function (req, res) {
        models.users.findOne({where: {id: req.decoded.userId},
            include: [{
                    model: models.customerdetails
                }]
        }).then(function (user) {
            var resData = {userId: user.id, email: user.email, name: user.name};

            if (typeof user.customerdetail != 'undefined' && user.customerdetail != '' && user.customerdetail != null) {
                resData.dob = user.customerdetail.dob;
                resData.mobile = user.customerdetail.mobile;
            }
            return res.json({
                success: true,
                message: 'Profile data.',
                result: resData
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).json({
                status: false,
                error: err.errors[0].message
            });
        }).catch(function (err) {
            return res.status(400).send({
                status: false,
                error: err.message
            });
        });
    },
    /**
     * @desc Update User Profile details
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    updateProfile: function (req, res) {
        var info = req.body;
        if (typeof info.email != "undefined") {
            models.users.findOne({where: {id: req.decoded.userId},
                include: [{
                        model: models.customerdetails
                    }]
            }).then(function (user) {
                //User data update
                user.name = info.name;
                user.email = info.email;
                user.save({individualHooks: true}).then(function (user) {
                    //Update customer details
                    isSaved = user.customerdetail.updateAttributes({
                        dob: info.dob,
                        mobile: info.mobile
                    });
                    //Send Response data
                    var resData = {dob: user.customerdetail.dob, mobile: user.customerdetail.mobile,
                        userId: user.id, email: user.email, name: user.name};
                    return res.json({
                        success: true,
                        message: appMessage.user.customer.success.profileUpdated,
                        result: resData
                    });
                }).catch(Sequelize.ValidationError, function (err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function (err) {
                    return res.status(400).send({
                        status: false,
                        error: err.message
                    });
                });
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).json({
                    status: false,
                    error: err.errors[0].message
                });
            }).catch(function (err) {
                return res.status(400).send({
                    status: false,
                    error: err.message
                });
            });
        } else {
            return res.status(400).json({
                success: false,
                error: appMessage.common.error.payloadError
            });
        }
    },
    /*
     * @desc Login with Email and Password
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    login: function (req, res) {
        var requiredParams = ['email', 'password'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var condition = {
                email: req.body.email,
                roleId: 3
            }
            models.users.findOne({where: condition,
                include: [{
                        model: models.customerdetails
                    }]
            }).then(function (data) {
                if (typeof data != 'undefined' && data != '' && data != null) {
                    if (typeof data.password != 'undefined' && (data.password != '' || data.password != null)) {
                        var result = bcrypt.compareSync(req.body.password, data.password);
                        if (result) {

                            isSaved = data.customerdetail.updateAttributes({
                                 dtId: req.body.dtId,
                                deviceToken: req.body.deviceToken
                            });
                            var response = [];
                            var resData = {dob: data.customerdetail.dob, mobile: data.customerdetail.mobile,
                                userId: data.id, email: data.email, name: data.name};
                            /*
                             * JWT token generation
                             */
                            var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                            res.setHeader('x-access-token', token);
                            response.result = resData;
                            helper.formatResponse(response, res, '');
                        } else {
                            return res.json({
                                success: false,
                                error: appMessage.user.customer.error.invalidCredencials
                            });
                        }
                    }
                } else {
                    return res.status(404).json({
                        success: false,
                        error: appMessage.user.customer.error.invalidCredencials
                    });
                }
            }).catch(function (error) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            });
        });
    },
    /**
     * @desc Logout form APP - device token and dtId set as blank
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    logout: function (req, res) {
        models.customerdetails.findOne({where: {userId: req.decoded.userId}}).then(function (customerData) {
            //Update Fields
            customerData.deviceToken = "";
//            customerData.dtId = "";
            customerData.save({individualHooks: true}).then(function (customerData) {
                return res.json({
                    success: true,
                    message: 'Logout successfully.',
                });
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).json({
                    status: false,
                    error: err.errors[0].message
                });
            }).catch(function (err) {
                return res.status(400).send({
                    status: false,
                    error: err.message
                });
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).json({
                status: false,
                error: err.errors[0].message
            });
        }).catch(function (err) {
            return res.status(400).send({
                status: false,
                error: err.message
            });
        });
    },
    /**
     * @desc Change Password with old-password, new-password and confirm password
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    changePassword: function (req, res) {
        var postData = req.body;
        models.users.findOne({where: {id: req.decoded.userId}}).then(function (user) {
            //Check old password
            var result = bcrypt.compareSync(req.body.oldPassword, user.password);
            if (result) {
                user.password = bcrypt.hashSync(postData.password);
                user.save().then(function (result) {
                    return res.json({
                        success: true,
                        message: appMessage.user.customer.success.passwordChanged,
                    });
                }).catch(Sequelize.ValidationError, function (err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function (err) {
                    return res.status(400).send({
                        status: false,
                        error: err.message
                    });
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: appMessage.user.customer.error.oldPasswordIncorrect,
                });
            }
        }).catch(function (err) {
            return res.status(400).send({
                status: false,
                error: err.message
            });
        });
    },
    /**
     * @desc Forget Password : send password to user resigtered email id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    forgetPassword: function (req, res) {
        var email = req.body.email;
        var requiredParams = ['email'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            models.users.findOne({
                where: {email: email, roleId: 3}
            }).then(function (data) {
                if (data !== null) {
                    var code = helper.generateRandomString(20);
                    var verificationData = {code: code, type: "forgetpassword", userId: data.id};
                    models.userverifications.create(verificationData).then(function (userVerificationObj) {
                          /*Send forgot password link*/
                        var link = process.env.CLIENT_RESET_PASSWORD_URL + code;
                         var message = swig.renderFile('./public/emailTemplate/forgot-password.html', {
                            user: data,
                            link: link,
                            path: process.env.CONTENT_URL
                        });
                        helper.sendEmail("Forgot Password", data.email, message, 'Account');
                        res.json({
                            success: true,
                            message: "Email has been sent successfuly",
                        });
                    }).catch(function (err) {
                        return res.status(400).send({
                            success: false,
                            message: err.message
                        });
                    });
                } else {
                    return res.status(404).send({
                        status: false,
                        error: appMessage.user.customer.error.dataNotFound
                    });
                }
            }).catch(function (error) {
                return res.status(400).send({
                    status: false,
                    error: error.message
                });
            });
        });
    },
    /**
     * @desc Forgot password Check Token
     * @param {type} req
     * @param {type} res
     * @param {type} next
     * @returns {Object} Returns success message in json object on success
     */
    forgotPasswordTokenCheck: function (req, res) {
        var inputs = req.body;
        if (typeof inputs.code != 'undefined') {
            var code = inputs.code;
            models.userverifications.findOne({where: {code: code, type: "forgetpassword"}}).then(function (userCheck) {
                if (userCheck && typeof userCheck.id != 'undefined' &&  userCheck.isActive == 0) {
                    return res.json({
                        success: true,
                        isValid: true,
                        message: 'Code is valid.'
                    });
                } else {
                    return res.json({
                        success: false,
                        isValid: false,
                        message: 'Code is invalid.'
                    });
                }
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).send(err.errors);
            }).catch(function (err) {
                return res.status(400).send({
                    success: false,
                    message: err.message
                });
            });
        } else {
            return res.json({
                success: false,
                message: 'Payload error.'
            });
        }
    },
    /**
     * @desc Change password from forgot password
     * @param {type} req
     * @param {type} res
     * @param {type} next
     * @returns {Object} Returns success message in json object on success
     */
    forgotPasswordChangePassword: function (req, res) {
        var inputs = req.body;
        if (typeof inputs.code != 'undefined' && typeof inputs.password != 'undefined') {
            models.userverifications.findOne({
                where: {
                    code: inputs.code,
                    type: "forgetpassword"
                }
            }).then(function(userCheck) {
                //check verification details
                if (userCheck && typeof userCheck.userId != "undefined") {
                    models.users.findOne({
                        where: {
                            id: userCheck.userId
                        }
                    }).then(function(user) {
                        if (userCheck.isActive == 0) {
                            models.userverifications.update({
                                isActive: 1
                            }, {
                                where: {
                                    userId: userCheck.userId
                                }
                            }).then(function(data) {
                                //set new password
                                if (typeof user.id != 'undefined') {
                                    user.password = bcrypt.hashSync(inputs.password);
                                    user.save().then(function(userDetail) {
                                        userCheck.destroy();
                                        return res.json({
                                            success: true,
                                            message: 'Password has been changed.'
                                        });

                                    }).catch(Sequelize.ValidationError, function(err) {
                                        return res.status(422).send(err.errors);
                                    }).catch(function(err) {
                                        return res.status(400).send({
                                            message: err.message
                                        });
                                    });
                                } else {
                                    return res.status(404).json({
                                        success: false,
                                        isValid: false,
                                        message: 'User is not exist'
                                    });
                                }
                            })
                        } else {
                            return res.json({
                                success: false,
                                isValid: false,
                                message: 'Code already used '
                            });

                        }
                    });
                } else {
                    return res.status(404).json({
                        success: false,
                        isValid: false,
                        message: 'Code is invalid.'
                    });
                }
            }).catch(function(err) {
                return res.status(400).send({
                    message: err.message
                });
            });
        } else {
            return res.json({
                success: false,
                message: 'Payload error.'
            });
        }
}
}


