                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
var base64 = require('base-64');
var swig = require('swig');
var bcrypt = require("bcrypt-nodejs");
var asyncLoop = require("node-async-loop");
/**
 * @desc Vendor Admin Controller
 */
module.exports = {
    /**
     * @desc Get List of Vendor Admin
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
         var timestamp = req.body.timestamp; 
        //Set default where condition
        var wherecondtion = {roleId:2,isDelete : 0};
        var vendorWhereCondition = {};
        var stdiumWhereCondition = {isActive:1,isDelete: 0};
         //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        if(typeof req.body.name != 'undefined' && req.body.name != '' && req.body.name != null) {
            wherecondtion.name = {$like: "%" + req.body.name + "%"};
        }
        if(typeof req.body.email != 'undefined' && req.body.email != '' && req.body.email != null) {
            wherecondtion.email = {$like: "%" + req.body.email + "%"};
        }
        //filted based on business name
        if(typeof req.body.businessName != 'undefined' && req.body.businessName != '' && req.body.businessName != null) {
            vendorWhereCondition.businessName = {$like: "%" + req.body.businessName + "%"};
        }
        //filted based on stadium name
        if(typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            stdiumWhereCondition.name = {$like: "%" + req.body.stadiumName + "%"};
        }
        models.users.findAll({
            attributes: ['id','name','email','isActive','isDelete','createdOn'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 50,
            include: [{
                where : vendorWhereCondition,
                attributes: ['id','businessName'],
                model: models.vendordetails,
                include : [{
                    where : stdiumWhereCondition,
                    attributes: ['id','name'],
                    model : models.stadiums
                }],
                required: false
            }],
            required: false
        }).then(function(data) {            
            if(data !== null) {
                   return res.json({
                   success: true,
                    result: data,
                    count: data.length
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.user.vendor.error.dataNotFound
                });
            }
        }).catch(function(error){
            return res.status(400).send({
                success: false,
                message: error.message
            });
        });       
    },
    /**
     * @desc Get Vendor Admin Details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        models.users.findOne({
            attributes: ['id','name','email','isActive','isDelete','createdOn'],
            where: {id:req.params.id},
            include: [{
                model: models.vendordetails,
                attributes: ['businessName','id'],
                include : [{
                    attributes: ['id','name'],
                    model : models.stadiums
                },{
                    model : models.vendorzones,
                    include : [{
                        attributes: ['id','zoneName'],
                        model : models.zones
                    }]
                }],
                required: false
            }],
//            required: false
        }).then(function (user) {            
            var resData = {id: user.id, email:user.email, name:user.name,
                isActive:user.isActive, createdOn:user.createdOn,
                businessName : user.vendordetail.businessName,vendorDetailsId: user.vendordetail.id
            };
            resData.stadium = user.vendordetail.stadium;
            var zones = user.vendordetail.vendorzones;
            var vendorZones = [];
            for(var i=0;i<zones.length;i++) {
                vendorZones.push(zones[i].zone);
            }
            resData.vendorzones = vendorZones;
            return res.json({
                success: true,
                result: resData
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).send(err.errors);
        }).catch(function (err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
    /**
     * @desc Create venors with data : email,name, businessName, stadium, zones
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create : function (req, res) {
        var postData = req.body;
        var requiredParams = ['email', 'name', 'businessName', 'stadiumId', 'zoneIds'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var userData = {email:postData.email, name:postData.name, isActive:0, isDelete:0, roleId:2};
            //Add user data
            models.users.create(userData).then(function(data){
                //add vendor data
                var vendorData = {businessName:postData.businessName,userId:data.id,
                        stadiumId:postData.stadiumId, createdBy:requestUserId,updatedBy:requestUserId};
                models.vendordetails.create(vendorData).then(function(vendorData) {
                    var zoneIds = postData.zoneIds;
                    var zoneIdAr = zoneIds.split(",");
                    var vendorZones = [];
                    for(var i=0;i<zoneIdAr.length;i++){
                        vendorZones.push({vendorDetailsId:vendorData.id,zoneId:zoneIdAr[i]});
                    }
                    models.vendorzones.bulkCreate(vendorZones).then(function(zoneData) {
                        //Send email with link to vendor email for activate account
                        var link = process.env.VENDOR_ACTIVATE_ACCOUNT_URL + base64.encode(data.id);
                        var message = swig.renderFile('./public/emailTemplate/acount-activation.html', {           
                            user: data,
                            link: link,
                            path: process.env.CONTENT_URL
                        });
                        helper.sendEmail("Activate Acount", data.email, message, 'Account');
                        return res.json({
                            success: true,
                            message: appMessage.user.vendor.success.vendorCreated,
                        });
                    }).catch(Sequelize.ValidationError, function(err) {
                        return res.status(422).json({
                            status: false,
                            error: err.errors[0].message
                        });
                    }).catch(function(err) {
                        return res.status(400).send({
                            success: false,
                            message: err.message
                        });
                    });
                }).catch(Sequelize.ValidationError, function(err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function(err) {
                    return res.status(400).send({
                        success: false,
                        message: err.message
                    });
                });                
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).json({
                    status: false,
                    error: err.errors[0].message
                });
            }).catch(function(err) {
                return res.status(400).send({
                    success: false,
                    message: err.message
                });
            });
        });
    },
    /**
     * @desc Vefiry Link with code
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    activationLinkVerify : function(req, res) {
        var verificationCode = req.params.code;
        var userId = base64.decode(verificationCode);
        models.users.findOne({
            where : {id:userId, roleId:2, isActive:0},
            include : [{
                    attributes : ['stadiumId','businessName'],
                    model :models.vendordetails,
                    include : [{
                            attributes : ['name'],
                            model :models.stadiums,
                    }]
            }],
        }).then(function(data){
            if(data != null) {
                //valid link
                var resData = {code:verificationCode,name: data.name,email:data.email,stadiumName:data.vendordetail.stadium.name}
                return res.json({
                    success: true,
                    isValid: true,
                    result : resData,
                    message: appMessage.user.vendor.success.validVerificationLink
                });
            } else {
                //invalid link
                return res.status(404).json({
                    success: false,
                    isValid: false,
                    message: appMessage.user.vendor.error.invalidVerificationLink
                });
            }
        }).catch(function(error){
            return res.status(400).json({
                success: false,
                message: error.message
            });
        })
    },
    /**
     * @desc Account Activate for Vendor
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    accountActivate : function(req, res) {
        var postData = req.body;
        var token = postData.code;
        var userId = base64.decode(token);
        models.users.findOne({
            where : {id:userId, roleId:2, isActive:0},
            include : [{
                    attributes : ['id'],
                    model :models.vendordetails,
            }]
        }).then(function(data){
            if(data != null) {                
                //update password and set isActive=1
                isSaved = data.updateAttributes({
                    password : bcrypt.hashSync(postData.password),
                    isActive: 1
                });
                models.vendorconfig.create({
                    keyName : 'minDelTime',
                    values : 40,
                    vendorDetailsId : data.vendordetail.id,
                }).then(function(data){
                    return res.json({
                        success: true,
                        isValid: true,
                        message: appMessage.user.vendor.success.activateAccountSuccess
                    });
                }).catch(function(error){
                    return res.status(400).json({
                        success: false,
                        message: error.message
                    });
                });                
            } else {
                //invalid link
                return res.status(404).json({
                    success: false,
                    isValid: false,
                    message: appMessage.common.error.pageNotFound
                });
            }
        }).catch(function(error){
            return res.status(400).json({
                success: false,
                message: error.message
            });
        });
    },
    /**
     * @desc Update Vendor details by Super Admin
     * @params name, businessName
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        var vendorUserId = req.params.id;
        var postData = req.body;
        
        models.users.findOne({
            where : {id:vendorUserId, roleId:2, isActive:1},
            include : [{
                    model :models.vendordetails,
            }]
        }).then(function(data){
            //update user data
            data.name = postData.name;
            data.save().then(function(user){
                //update vendor details
                user.vendordetail.updateAttributes({
                        updatedBy:requestUserId,
                        businessName:postData.businessName
                });
                return res.json({
                    success: true,
                    message: appMessage.user.vendor.success.vendorUpdated,
                });
            }).catch(function(error){
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            });            
        }).catch(function(error){
            return res.status(400).json({
                success: false,
                message: error.message
            });
        });        
    },
/**
     * @desc Delete vendor
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {
        var userId = req.params.id;
        var postData = req.body;
        models.users.findOne({
            where: {id: userId},
        }).then(function(user) {
            user.isDelete = postData.isDelete;
            user.id = postData.id;
            user.save().then(function(result) {
                models.users.update({
                     isActive: 0
                    }, {
                    where: {id: userId}
                     }).then(function(data) {
                        return res.json({
                        success: true,
                        message: appMessage.user.vendor.success.vendorDeleted,
                    });
                });
            }).catch(function(err) {
                return res.status(400).send({
                    success: false,
                    message: err.message
                });
            });
        }).catch(function(err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
     /**
     * @desc totalOrder vendor
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    totalOrder: function(req, res, next) {
        var vendorDetailsId = req.params.vendorDetailsId;
        var OrderItemsQuery = "SELECT SUM(orderitems.price ) AS TotalItemsOrdered\n\
                                            FROM orderitems\n\
                   LEFT JOIN products ON orderitems.productId = products.id \n\
                    WHERE vendorDetailsId=" + vendorDetailsId;
        var OrderDealsQuery = "SELECT SUM(orderdealsitems.price) AS TotalDealsOrdered \n\
                    FROM orderdealsitems LEFT JOIN `deals` ON orderdealsitems.dealId = deals.id \n\
                    LEFT JOIN dealsproducts ON deals.id = dealsproducts.dealId \n\
                    LEFT JOIN products ON dealsproducts.productId = products.id \n\
                    WHERE vendorDetailsId=" + vendorDetailsId + " GROUP BY orderdealsitems.id ";
        var query = "(" + OrderItemsQuery + ") UNION (" + OrderDealsQuery + ")";
        models.sequelize.query(query).then(function(data) {
            var total = 0
            var finalprize = 0
            _.each(data[0], function(each) {
                total += each.TotalItemsOrdered;
            })
            finalprize = total + (total * 0.18)
            res.json({
                success: true,
                message: "success",
                result: finalprize,
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