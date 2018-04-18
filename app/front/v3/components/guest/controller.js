/**
 * Guest User controller
 */
var jwt = require('jsonwebtoken');

module.exports = {
    /**
     * @desc Add Guest User with details
     * email : email id
     * name : full name
     * dob : date of birth
     * mobile : mobile number
     * dtId : 2 :Android, 3: iOS 
     * deviceToken : device token
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    addGuestUser: function (req, res) {
        var postData = req.body;

        var requiredParams = ['email', 'name', 'dob', 'mobile', 'dtId', 'deviceToken'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            //check email id exist or not
            models.users.findOne({
                where : {email: postData.email},
                include: [{
                    model: models.customerdetails
                }]
            }).then(function(guest) {              
                if (typeof guest != 'undefined' && guest != '' && guest != null) {                    
                    //Check role
                    if(guest.roleId == 4) {
                        //Update data 
                        guest.name = postData.name;
                        guest.save({individualHooks: true}).then(function(user){
                            //Update customer details
                            isSaved = guest.customerdetail.updateAttributes({
                                dob: postData.dob,
                                mobile: postData.mobile,
                                dtId: postData.dtId,
                                deviceToken: postData.deviceToken
                            });
                            var resData = {dob: guest.customerdetail.dob, mobile: guest.customerdetail.mobile, userId: user.id,
                                email: user.email, name: user.name, roleId: 4, isGuest:1};
                            var token = jwt.sign(JSON.stringify(resData), process.env.JWT_SECRET_KEY);
                            res.setHeader('x-access-token', token);
                            var response = [];
                            response.result = resData;
                            helper.formatResponse(response, res, '');
                        }).catch(function(error){
                            res.status(400).json({
                                status: false,
                                error: error
                            });
                        });
                    } else {
                        //System user exist as normal user
                        res.status(406).json({
                            status: false,
                            error: appMessage.guest.error.userExist
                        });
                    }
                } else {
                   var userData = {email: postData.email, name: postData.name, roleId: 4};
                    //Add data to users
                    models.users.create(userData).then(function (data) {
                        //add customer details
                        var customerData = {dob: postData.dob, mobile: postData.mobile, dtId: postData.dtId,
                            deviceToken: postData.deviceToken, userId: data.id};
                        models.customerdetails.create(customerData).then(function (customer) {
                            var resData = {dob: customer.dob, mobile: customer.mobile, userId: data.id,
                                email: data.email, name: data.name, roleId: 4, isGuest:1};
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
            }).catch(function(error){
                res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
        });
    },
}