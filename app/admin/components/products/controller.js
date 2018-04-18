
/**
 * @desc Products API Controller
 */
module.exports = {
    /**
     * @desc Get List of Products based on vendor id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {      
        console.log("----------------------")
        var vendorId = req.body.vendorId;
        var timestamp = req.body.timestamp;
        //Set default where condition
        var wherecondtion = {isDelete: 0};
        var stadiumWhere = {isActive:1,isDelete: 0};
        var vendorWhere = {};
        var businessWhere = {};
        var categoryWhere = {isActive:1,isDelete: 0};
        //Set where condition with timestamp
        if (typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt: timestamp};
        }
        //If vendor Id is null then list all product for super admin
        if (typeof vendorId != 'undefined' && vendorId != '' && vendorId != null) {
            wherecondtion.vendorDetailsId = vendorId;
        }
        if (typeof req.body.name != 'undefined' && req.body.name != '' && req.body.name != null) {
            wherecondtion.name = {$like: "%" + req.body.name + "%"};
        }
        //filter based on category name
        if (typeof req.body.categoryName != 'undefined' && req.body.categoryName != '' && req.body.categoryName != null) {
            categoryWhere.name = {$like: "%" + req.body.categoryName + "%"};
        }
        //filter based on vendor name
        if (typeof req.body.vendorName != 'undefined' && req.body.vendorName != '' && req.body.vendorName != null) {
            vendorWhere.name = {$like: "%" + req.body.vendorName + "%"};
        }
         //filter based on business name
        if (typeof req.body.businessName != 'undefined' && req.body.businessName != '' && req.body.businessName != null) {
            businessWhere.businessName = {$like: "%" + req.body.businessName + "%"};
        }
        //filter based on stadium name
        if (typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            stadiumWhere.name = {$like: "%" + req.body.stadiumName + "%"};
        }
        //get data
        models.products.findAll({
            attributes: ['id', 'name', 'image', 'shortDesc', 'price','quantity','longDesc','createdOn','vendorDetailsId','isActive'],
            where: wherecondtion,
            order: "createdOn DESC",
            limit: 50,
            include: [{
                where : categoryWhere,
                attributes: ['id', 'name'],
                model: models.productcategory,
//                required: false
            },{  
                where : businessWhere ,            
                attributes: ['id','businessName','userId'],
                model: models.vendordetails,
                required: false,
                include: [{
                    where : stadiumWhere,
                    attributes: ['name', 'address'],
                    model: models.stadiums,
//                    required: false
                },{
                   // where : vendorWhere,
                    attributes: ['id','name'],
                    model: models.users,
                    as : 'vendorUser',
//                    required: false 
                }]
            }],
            required: false,
        }).then(function (data) {
            var condition = {isDelete: 0}
            if(typeof req.body.vendorId != "undefined"){
               condition.vendorDetailsId = req.body.vendorId
            }
            models.products.count({
                where: condition
            }).then(function(CountData) {
                    if (data !== null) {
                    return res.json({
                        success: true,
                        result: data,
                        count: CountData
                    });
                } else {
                    return res.status(404).send({
                        message: appMessage.stadium.error.dataNotFound
                    });
                }
            }).catch(function(error) {
                helper.formatResponse('', res, error);
            });
        });
},
    /**
     * @desc Get details of product by id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        var productId = req.params.id;
        //get product data
        models.products.findOne({
            attributes : ['id','name','image','shortDesc','longDesc','price','createdOn','categoryId','quantity'],
            where : {id : productId},
            include: [{
                 attributes: ['id', 'name'],
                model: models.productcategory,
            },{
               model: models.vendordetails,
                attributes: ['id','businessName','userId'],
                required: false,
                include: [{
                     attributes: ['id','name','address'],
                    model : models.stadiums,
                },{
                    model: models.vendorzones,
                    attributes: ['id','zoneId'],
                    include: [{
                        model: models.zones,
                        attributes: ['id','zoneName'],
                    }],
                }],
            }],

        }).then(function(data){
            if (data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.product.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });        
    },
    /**
     * @desc Add new product with details
     * @param name
     * @param categoryId
     * @param vendorDetailsId
     * @param image
     * @param shortDesc
     * @param longDesc
     * @param price
     * @param quantity
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create : function (req, res) {
        var postData = req.body;
        var image;
        var fileName = uuid.v1();
        //Check file selected or not
        if (!req.files) {
            return res.status(422).json({
                success: false,
                result: 'No files were uploaded.'
            });
        }
        //image file
        image = req.files.image;
        var ext = path.extname(image.name);
        var fileNewName = fileName + ext;

        //check file extensions
        var allowed = ['.jpg', '.jpeg', '.png'];
        if (allowed.indexOf(ext.toString().toLowerCase()) === -1) {
            return res.status(422).json({
                success: false,
                result: 'Invalid file type.'
            });
        }
        //Upload image
        image.mv(imageUploadPath + "products/" + fileNewName, function (err) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    result: "Something went wrong, Please try again."
                });
            } else {
                var productData = {
                    name: postData.name,
                    image: process.env.UPLOAD_URL + 'products/' + fileNewName,
                    categoryId: postData.categoryId,
                    vendorDetailsId: postData.vendorDetailsId,
                    shortDesc: postData.shortDesc,
                    longDesc: postData.longDesc,
                    price: postData.price,
                    quantity: postData.quantity,
                    isActive: 1,
                    isDelete: 0,
                    createdBy: requestUserId,
                    updatedBy: requestUserId,
                };
                //Add data
                models.products.create(productData).then(function (data) {
                    return res.json({
                        success: true,
                        message: appMessage.product.success.dataAdded,
                        result: data
                    });
                }).catch(Sequelize.ValidationError, function (err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function (error) {
                    return res.status(400).send({
                        status: false,
                        error: error.message,
                    });
                });
            }
        });
    },
    /**
     * @desc Update product with details 
     * @param name 
     * @param categoryId
     * @param imgae
     * @param shortDesc
     * @param longDesc
     * @param price
     * @param quantity
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        var postData = req.body;        
        models.products.findOne({
            where: {id: req.params.id}
        }).then(function (data) {
            if (data !== null) {
                //Set new property data
                data.name = postData.name;
                data.shortDesc = postData.shortDesc;
                data.longDesc = postData.longDesc;
                data.categoryId = postData.categoryId;
                data.price = postData.price;
                data.quantity = postData.quantity;
                data.isActive = postData.isActive;
                data.updatedBy = requestUserId;
                //Image upload
                if (typeof req.files != 'undefined' && req.files != '' && req.files != null) {
                    var image;
                    var fileName = uuid.v1();
                    image = req.files.image;
                    var ext = path.extname(image.name);
                    var fileNewName = fileName + ext;
                    //check file extensions
                    var allowed = ['.jpg', '.jpeg', '.png'];
                    if (allowed.indexOf(ext.toString().toLowerCase()) === -1) {
                        return res.status(422).json({
                            success: false,
                            result: 'Invalid file type.'
                        });
                    }
                    image.mv(imageUploadPath + "products/" + fileNewName, function (err) {
                        if(err) {
                            return res.status(400).json({
                                success: false,
                                result: "Something went wrong, Please try again."
                            });
                        } else {
                            data.image = process.env.UPLOAD_URL + 'products/' + fileNewName;
                             data.save().then(function (data) {
                    return res.json({
                        success: true,
                        message: appMessage.product.success.dataUpdated,
                        result: data
                    });
                }).catch(Sequelize.ValidationError, function (err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function (error) {
                    return res.status(400).send({
                        status: false,
                        error: error.message,
                    });
                });
                        }
                    });
                } else {
                //save data
                data.save().then(function (data) {
                    return res.json({
                        success: true,
                        message: appMessage.product.success.dataUpdated,
                        result: data
                    });
                }).catch(Sequelize.ValidationError, function (err) {
                    return res.status(422).json({
                        status: false,
                        error: err.errors[0].message
                    });
                }).catch(function (error) {
                    return res.status(400).send({
                        status: false,
                        error: error.message,
                    });
                });
             }
            } else {
                return res.status(404).send({
                    message: appMessage.stadium.error.dataNotFound
                });
            }
        }).catch(function (error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Delete Product - set isDelete:1 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {        
        var productId = req.params.id;
        var postData = req.body;
        models.products.findOne({
            where: {id: productId},
        }).then(function(product) {
            product.isDelete = postData.isDelete;
            product.id = postData.id;
            product.save().then(function(result) {
                models.products.update({
                     isActive: 0
                    }, {
                    where: {id: productId}
                }).then(function(data1) {
                models.dealsproducts.findAll({
                    where: {productId: product.id}
                }).then(function(data) {
                    var deals = [];
                    _.each(data, function(allproducts) {
                        deals.push(allproducts.dealId)
                    })
                    models.deals.update({
                        isActive: 0
                    }, {
                        where: {id: deals}
                    }).then(function(data1) {
                        return res.json({
                            success: true,
                            message: appMessage.product.success.dataUpdated,
                        });
                  })
              })
            })
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
     * @desc Product Dropdown 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProducts: function(req, res) {
        var productId = req.params.id;
        //get product data
        models.products.findAll({
            attributes: ['id', 'name', 'image', 'shortDesc', 'longDesc', 'price', 'createdOn', 'categoryId', 'quantity'],
            where: {
                vendorDetailsId: productId,
                isActive : true,
                isDelete : 0
            },
        }).then(function(data) {
            if (data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.product.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },

     /**
     * @desc Product status  
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
     updateStatus : function (req, res) {
        var postData = req.body
        var updateCondition = {isActive: postData.isActive}
        models.products.update(updateCondition, {
            where: {id: postData.productId}
        }).then(function(product) {
            models.dealsproducts.findAll({
                where: {productId: postData.productId}
            }).then(function(data) {
                var deals = [];
                _.each(data, function(allproducts) {
                    deals.push(allproducts.dealId)
                })
               deals = _.uniq(deals);
                models.deals.update({
                    isActive: postData.isActive
                }, {
                    where: {id: deals}

                }).then(function(result) {
                    res.json({
                        success: true,
                        message:appMessage.product.success.statusUpdated,
                    })
                })
            })
        }).catch(function(err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
}