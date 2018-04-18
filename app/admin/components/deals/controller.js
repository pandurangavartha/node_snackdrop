/**
 * @desc Deals Controller
 */
module.exports = {
    /**
     * @desc Get List of Deals
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
     getList: function (req, res) {        
        var timestamp = req.body.timestamp;
        //Set default where condition
        var wherecondtion = {isDelete: 0};
        var productWhere = {};
        //Set where condition with timestamp
         if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        //filter based on deals name
        if (typeof req.body.dealName != 'undefined' && req.body.dealName != '' && req.body.dealName != null) {
            wherecondtion.name = {$like: "%" + req.body.dealName + "%"};
        }
        //filter based on Product name
        if (typeof req.body.productName != 'undefined' && req.body.productName != '' && req.body.productName != null) {
            productWhere.name = {$like: "%" + req.body.productName + "%"};
        }
        if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
            productWhere.vendorDetailsId = req.body.vendorId 
        }
        //get data
         models.deals.findAll({
            attributes: ['id','name','price','quantity','createdOn','image','shortDesc','longDesc','isActive'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 50,
            include : [{
                where: productWhere,
                model : models.products,
                attributes: ['id','name','image','shortDesc','longDesc','price','quantity','vendorDetailsId'],
                include: [{       
                attributes: ['id','businessName','userId'],
                model: models.vendordetails,
                required: false,
               }],
            }],
            required: false,
        }).then(function (data) {
            if (data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.deals.error.dataNotFound
                });
            }
        }).catch(function (error) {
            helper.formatResponse('', res, error);
        });
    },
      /**
     * @desc Get details of deals by id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    
     viewDetails: function (req, res) {
        var dealId = req.params.id;
        //get deals data
        models.deals.findOne({
            attributes : ['id','name','image','shortDesc','longDesc','price','createdOn','stadiumId','quantity'],
            where : {id : dealId},
            include : [{
                model : models.products,
                attributes: ['id','name','image','shortDesc','longDesc','price','quantity','vendorDetailsId'],
            }],
            required: false,
        }).then(function(data){
            if (data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.deals.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });        
    },
      /**
     * @desc Add new deals with details
     * @param name
     * @param stadiumId
     * @param image
     * @param shortDesc
     * @param longDesc
     * @param price
     * @param quantity
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create: function(req, res) {
        var postData = req.body;
        var image;
        var fileName = uuid.v1();
        //Check file selected or not
        if (!req.files) {
            return res.status(422).json({
                success: false,
                message: 'No files were uploaded.'
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
        image.mv(imageUploadPath + "deals/" + fileNewName, function(err) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    result: "Something went wrong, Please try again."
                });
            } else {
                var dealProductData = postData.dealProduct;
                var dealsData = {
                    stadiumId: postData.stadiumId,
                    image: process.env.UPLOAD_URL + 'deals/' + fileNewName,
                    name: postData.name,
                    shortDesc: postData.shortDesc,
                    longDesc: postData.longDesc,
                    price: postData.price,
                    quantity: postData.quantity,
                    isActive: 0,
                    isDelete: 0,
                    createdBy: requestUserId,
                    updatedBy: requestUserId,
                };
                var product = eval(postData.productId);
                //add data to deals table
                if (typeof postData.productId != "undefined" && postData.productId) {
                    models.deals.create(dealsData).then(function(data) {
                        var productDealsInsObject = [];
                        product.forEach(function(prm) {
                            var temp = {
                                dealId: data.id,
                                productId: prm.productId,
                            }
                            productDealsInsObject.push(temp);
                        });
                        models.dealsproducts.bulkCreate(productDealsInsObject).then(function(productDealsData) {
                            data.productDealsData = productDealsData
                            return res.json({
                                success: true,
                                result: data,
                                dealProduct: productDealsData,
                                message: appMessage.deals.success.dataAdded,
                            });
                        });
                    }).catch(Sequelize.ValidationError, function(err) {
                        return res.status(422).json({
                            success: false,
                            error: err.errors[0].message
                        });
                    }).catch(function(error) {
                        return res.status(400).send({
                            status: false,
                            error: error.message,
                        });
                    });
                } else {
                    return res.status(422).json({
                        status: false,
                        message: "please select products"
                    })
                }
            }
        });
    },
    /**
     * @desc Update deals with details 
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
    update: function(req, res) {
        var postData = req.body;
        var dealId = req.params.id;
        models.deals.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(data) {
            if (data !== null) {
                //Set new property data
                data.name = postData.name;
                data.shortDesc = postData.shortDesc;
                data.longDesc = postData.longDesc;
                data.stadiumId = postData.stadiumId;
                data.price = postData.price;
                data.quantity = postData.quantity;
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
                    image.mv(imageUploadPath + "deals/" + fileNewName, function(err) {
                        if (err) {
                            return res.status(400).json({
                                success: false,
                                result: "Something went wrong, Please try again."
                            });
                        } else {
                            data.image = process.env.UPLOAD_URL + 'deals/' + fileNewName;
                            data.image = (data.image != '') ? data.image : ""
                            data.save().then(function(data) {
                                if (typeof postData.productId != "undefined" && postData.productId) {
                                    var product = eval(postData.productId);
                                    models.dealsproducts.destroy({
                                        where: {
                                            dealId: dealId
                                        }
                                    }).then(function(result) {
                                        var productDealsInsObject = [];
                                        product.forEach(function(prm) {
                                            var temp = {
                                                dealId: data.id,
                                                productId: prm.productId,
                                            }
                                            productDealsInsObject.push(temp);
                                        });
                                        models.dealsproducts.bulkCreate(productDealsInsObject).then(function(productDealsData) {
                                            data.productDealsData = productDealsData
                                            return res.json({
                                                success: true,
                                                message: appMessage.deals.success.dataUpdated,
                                                result: data,
                                                dealProduct: productDealsData,
                                            });
                                        });

                                    });
                                } else {
                                    return res.status(422).json({
                                        status: false,
                                        message: "please select products"
                                    })
                                }
                            }).catch(Sequelize.ValidationError, function(err) {
                                return res.status(422).json({
                                    status: false,
                                    error: err.errors[0].message,
                                });
                            }).catch(function(error) {
                                return res.status(400).send({
                                    status: false,
                                    error: error.message,
                                });
                            });
                        }
                    });
                } else {
                    data.save().then(function(data) {
                        if (typeof postData.productId != "undefined" && postData.productId) {
                            var product = eval(postData.productId);
                            models.dealsproducts.destroy({
                                where: {
                                    dealId: dealId
                                }
                            }).then(function(result) {
                                var productDealsInsObject = [];
                                product.forEach(function(prm) {
                                    var temp = {
                                        dealId: data.id,
                                        productId: prm.productId,
                                    }
                                    productDealsInsObject.push(temp);
                                });
                                models.dealsproducts.bulkCreate(productDealsInsObject).then(function(productDealsData) {
                                    data.productDealsData = productDealsData
                                    return res.json({
                                        success: true,
                                        message: appMessage.deals.success.dataUpdated,
                                        result: data,
                                        dealProduct: productDealsData,
                                    });
                                });
                            });
                        } else {
                           return res.status(422).json({
                                status: false,
                                message: "please select products"
                            })
                        }
                    }).catch(Sequelize.ValidationError, function(err) {
                        return res.status(422).json({
                            status: false,
                            error: err.errors[0].message
                        });
                    }).catch(function(error) {
                        return res.status(400).send({
                            status: false,
                            error: error.message,
                        });
                    });
                }
            } else {
                return res.status(404).send({
                    message: appMessage.deals.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Delete deals - set isDelete:1 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {        
        var dealId = req.params.id;
        var postData = req.body;
       models.deals.findOne({
           where : {id : dealId},
       }).then(function(deal) {
            deal.isDelete = postData.isDelete;
            deal.id = postData.id;
            deal.save().then(function(result) {
                 models.deals.update({
                     isActive: 0
                    }, {
                    where: {id: dealId}
                }).then(function(data1) {
                return res.json({
                    success: true,
                    message: appMessage.deals.success.dataDeleted,
                });
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
     * @desc Update deals Status - set isActive:1 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    updateDealStatus : function (req, res) {
        var dealId = req.params.id;
        var postData = req.body;
        models.deals.findOne({
            where : {id : dealId},
        }).then(function(deal) {
            deal.isActive = postData.isActive;
            deal.save().then(function(result) {
                return res.json({
                    success: true,
                    message: appMessage.deals.success.dataUpdated,
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
}