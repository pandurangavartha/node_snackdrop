var swig = require('swig');
var jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");
/**
 * @desc User Controller
 */
module.exports = {
    /**
     * @desc Get Admin Profile Data
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    adminProfile: function (req, res) {

        models.users.findOne({where: {id: req.decoded.userId},
            include: [{
                    model: models.vendordetails,
                    include: [models.stadiums]
                }],
        }).then(function (data) {
           
            if (typeof data != 'undefined' && data != '' && data != null) {
                var resData = {userId: data.id, email: data.email, name: data.name, roleId: data.roleId}
                //Vendor data if roleId = 2                                
                if (data.roleId == 2) {
                    resData.businessName = data.vendordetail.businessName;
                    var stadiumData = data.vendordetail.stadium;
                    resData.stadium = {id: stadiumData.id, name: stadiumData.name, image: stadiumData.image,
                        address: stadiumData.address, latitude: stadiumData.latitude, longitude: stadiumData.longitude};
                }
                var response = [];
                response.result = resData;
                helper.formatResponse(response, res, '');
            } else {
                return res.status(404).json({
                    success: false,
                    error: appMessage.user.vendor.error.dataNotFound
                });
            }
        }).catch(function (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        });
    },

    /**
     * @desc Update Admin Profile details
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    updateAdminProfile: function (req, res) {
        var info = req.body;
        if (typeof info.email != "undefined") {
            models.users.findOne({where: {id: req.decoded.userId},
                include: [{
                        model: models.vendordetails,
                        include: [models.stadiums]
                    }]
                 }).then(function (user) {
                //User data update
                 user.name = info.name;
                user.email = info.email;
                user.save({individualHooks: true}).then(function (user) {
                    //Update admin details
                /*  isSaved = user.vendordetails.updateAttributes({
                        businessName: info.businessName,
                        mobile: info.mobile
                    });*/
                   //Send Response data
                    var resData = {userId: user.id, email: user.email, name: user.name, roleId: user.roleId}
                   //Vendor data if roleId = 2                                
                    if (user.roleId == 2) {
                        resData.businessName = user.vendordetail.businessName;
                        var stadiumData = user.vendordetail.stadium;
                        resData.stadium = {id: stadiumData.id, name: stadiumData.name, image: stadiumData.image,
                            address: stadiumData.address, latitude: stadiumData.latitude, longitude: stadiumData.longitude};
                    }
                    return res.json({
                        success: true,
                        message: appMessage.user.vendor.success.profileUpdated,
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
     * 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     * @desc : Login Using Google or social Login
     */
    adminLogin: function (req, res) {
        var requiredParams = ['email', 'password'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var condition = {
                email: req.body.email,
            }
            models.users.findOne({where: condition,
                include: [{
                        model: models.vendordetails,
                        include: [models.stadiums]
                    }]
            }).then(function (data) {
                if (typeof data != 'undefined' && data != '' && data != null) {
                    if (typeof data.password != 'undefined' && (data.password != '' || data.password != null)) {
                        var result = bcrypt.compareSync(req.body.password, data.password);
                        if (result) {
                            var resData = {userId: data.id, email: data.email, name: data.name, roleId: data.roleId}
                            //Vendor data if roleId = 2                                
                            if (data.roleId == 2) {
                                resData.businessName = data.vendordetail.businessName;
                                resData.vendorId = data.vendordetail.id;
                                var stadiumData = data.vendordetail.stadium;
                                resData.stadium = {id: stadiumData.id, name: stadiumData.name, image: stadiumData.image,
                                    address: stadiumData.address, latitude: stadiumData.latitude, longitude: stadiumData.longitude};
                            }
                              if (data.isActive == true) {
                            /*
                             * JWT token generation
                             */
                            var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                            res.setHeader('x-access-token', token);
                            var response = [];
                            response.result = resData;
                            helper.formatResponse(response, res, '');
                              } else {
                                return res.json({
                                    success: false,
                                    message: 'Please activate your account to login.'
                                });
                            }
                        } else {
                            return res.json({
                                success: false,
                                message: appMessage.user.vendor.error.invalidCredencials
                            });
                        }
                    }

                } else {
                    return res.status(404).json({
                        success: false,
                        error: appMessage.user.vendor.error.invalidCredencials
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
     * @desc Forget Password API - get link in email to reset password
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    adminForgetPassword: function (req, res) {
        email = req.body.email;
        var requiredParams = ['email'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {

       //get user data based on email id
        models.users.findOne({
            where: {email: email}
        }).then(function (data) {
            if (typeof data != 'undefined' && data != '' && data != null) {
                var code = helper.generateRandomString(20);
                   var verificationData = {code: code, type: "forgetpassword", userId: data.id};
                    models.userverifications.create(verificationData).then(function (userVerificationObj) {
                         /*Send forgot password link*/
                        var link = process.env.CLIENT_FORGOT_PASSWORD_URL + code;
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
                //no data found
                return res.status(404).json({
                     success: false,
                     error: appMessage.user.vendor.error.dataNotFound
                  });
              }
           }).catch(function (error) {
               return res.status(400).json({
                  success: false,
                  error: error.message
              });
          });

       })
    },
     /**
     * @desc Forgot password Check Token
     * @param {type} req
     * @param {type} res
     * @param {type} next
     * @returns {Object} Returns success message in json object on success
     */
    adminForgotPasswordTokenCheck: function (req, res) {
        var inputs = req.body;
        if (typeof inputs.code != 'undefined') {
            var code = inputs.code;
            models.userverifications.findOne({where: {code: code, type: "forgetpassword"}}).then(function (userCheck) {
                if (userCheck && typeof userCheck.id != 'undefined' && userCheck.isActive == 0) {
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
    adminForgotPasswordChangePassword: function(req, res) {
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
                if(postData.password != ""){
                     user.password = bcrypt.hashSync(postData.password);
                }
               
                user.save().then(function () {
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
     * @desc  get Dashboard for superAdmin with all count
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
getDashboardSuperAdmin: function(req, res) {
    models.sequelize.query("SELECT zoneCount ,ordersCount, vendorCount,productsCount,dealsCount,customerCount,categoryCount,stadiumCount FROM \n\
                          (SELECT COUNT(DISTINCT zones.id ) AS zoneCount FROM zones) t1, \n\
                          (SELECT COUNT(DISTINCT orders.id ) AS ordersCount FROM orders) t2, \n\
                          (SELECT COUNT(DISTINCT users.id ) AS vendorCount FROM users WHERE roleId = 2 AND isDelete = 0 AND isActive = 1) t3,\n\
                          (SELECT COUNT(DISTINCT products.id ) AS productsCount FROM products) t4,\n\
                          (SELECT COUNT(DISTINCT deals.id ) AS dealsCount FROM deals where isDelete = 0) t5,\n\
                          (SELECT COUNT(DISTINCT users.id ) AS customerCount FROM users WHERE roleId = 3 AND isDelete = 0) t6,\n\
                          (SELECT COUNT(DISTINCT productcategories.id ) AS categoryCount FROM productcategories where isDelete = 0   ) t7,\n\
                          (SELECT COUNT(DISTINCT stadiums.id ) AS stadiumCount FROM stadiums) t8", {
            type: models.sequelize.QueryTypes.SELECT
        }).then(function(data) {
        res.json({
            success: true,
            message: "success",
            result: data,
        });
    }).catch(Sequelize.ValidationError, function(err) {
        return res.status(422).send(err.errors);
    }).catch(function(err) {
        return res.status(400).send({
            message: err.message
        });
    });
},
     /**
     * @desc  get Dashboard for VendorAdmin with zone count
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
        getDashboardVendorAdmin: function(req, res) {
        var vendorDetailsId = req.params.vendorDetailsId;
        var query = "SELECT COUNT(DISTINCT vendorzones.id ) AS zoneCounts FROM vendorzones \n\
                     WHERE isActive = 1 and vendorDetailsId=" + vendorDetailsId;
        models.sequelize.query(query).then(function(data) {
            res.json({
                success: true,
                message: "success",
                result: data,
            });
        }).catch(Sequelize.ValidationError, function(err) {
            return res.status(422).send(err.errors);
        }).catch(function(err) {
            return res.status(400).send({
                message: err.message
            });
        });
    },
}