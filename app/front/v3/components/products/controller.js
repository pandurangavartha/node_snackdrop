/**
 * @desc Product Category & Products APIs controller
 */
module.exports = {
    /**
     * @desc Get Product category list based on stadiumId
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProductCategoryList: function (req,res) {
        var stadiumId = req.params.stadiumId;        
        models.productcategory.findAll({
            attributes: ['id','name'],
            where: {
                stadiumId: stadiumId, isActive:true,isDelete: false
            },
            order :"name ASC",
        }).then(function(data) {            
            if(typeof data != 'undefined' && data != '' && data != null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.product.error.categoryDataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        })
    },
    /**
     * @desc Get Product List based on categoryId
     * Pagination depends on createdOn timestamp
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProductList : function(req,res) {
        var categoryId = req.body.categoryId;        
        var timestamp = req.body.timestamp;
        //Image magic for resize image
        var width = 300;
        if(typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }        
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        //Set default where condition
        var wherecondtion = {
                categoryId: categoryId,
                isActive:true,
                isDelete: false
            };
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion =  {
                categoryId: categoryId,
                isActive:true,
                createdOn : {$lt : timestamp}
            };
        }
        //Fetch products based on categoryId
        models.products.findAll({
            attributes: ['id','name','image','shortDesc','longDesc','price',
                'createdOn','categoryId','vendorDetailsId'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 10,
            include: [{
                attributes: ['id', 'name'],
                model: models.productcategory,
                required: false
            },{
                attributes: ['id','businessName'],
                model: models.vendordetails,
                required: false,
                include: [{
                    attributes: ['keyName', 'values'],
                    model: models.vendorconfig,
                    required: false
                }]
            }],
            required: false,
        }).then(function(data) {
            if(typeof data != 'undefined' && data != '' && data != null) {
                var resData = [];
                //Image resize function call
                for(var i = 0; i < data.length;i++) {                    
                    var configObj = data[i].vendordetail.vendorconfigs.find(o => o.keyName === 'minDelTime');
                    var product = {
                        "id": data[i].id,
                        "name": data[i].name,
                        "image": (data[i].image != "") ? resizeFunUrl+encodeURIComponent(data[i].image) : "",
                        "shortDesc": data[i].shortDesc,
                        "longDesc": data[i].longDesc,
                        "price": data[i].price,
                        "createdOn": data[i].createdOn,
                        "productcategory": {
                            "id": data[i].productcategory.id,
                            "name": data[i].productcategory.name,
                        },
                        "minDelTime" : configObj.values,
                        isDeal : 0
                    };
                    resData[i] = product;
                }
                return res.json({
                    success: true,
                    result: resData
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.product.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Search Prodct & Deals API based on keywaord
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    searchProduct : function(req, res) {
        var keyword = req.body.keyword;
        var stadiumId = req.body.stadiumId;
        var timestamp = req.body.timestamp;
        //Image magic for resize image
        var width = 300;
        if(typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        //Set default where condition
        var searchQuery = "SELECT * FROM dealandproducts WHERE  stadiumId = "+stadiumId+" AND name LIKE '%"+keyword+"%'"
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            searchQuery = "SELECT * FROM dealandproducts WHERE stadiumId = "+stadiumId+" AND name LIKE '%"+keyword+"%' AND createdOn < '"+timestamp+"'"
        }
        searchQuery = searchQuery + " Order by isDeal DESC, createdOn DESC LIMIT 10";
        //deals 
        sequelize.query(searchQuery).spread(function(results, metadata) {            
            if(typeof results != 'undefined' && results != '' && results != null) {
                for(var i = 0; i < results.length;i++) {
                    results[i].image = (results[i].image != "") ? resizeFunUrl+encodeURIComponent(results[i].image) : "";
                }
                return res.json({
                    success: true,
                    result: results
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.common.error.dataNotFound
                });
            }            
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });        
    },
    /**
     * @desc Get Product List based on status
     * Pagination depends on createdOn timestamp
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProductStatus: function(req, res) {
        var productId = req.body.productId;
        var postData = req.body;
        if (typeof postData.productId != 'undefined' && postData.productId != '' && postData.productId.length != 0 && typeof postData.dealId != 'undefined' && postData.dealId != '' && postData.dealId.length != 0) {
            productData(req, res).then(function(data) {
                dealData(req, res).then(function(data1) {
                    var finaldata = []
                    _.each(data.result, function(val) {
                        if (val != '') {
                            finaldata.push(val)
                        }
                    })
                    _.each(data1.result, function(val) {
                        if (val != '') {
                            finaldata.push(val)
                        }
                    })
                    return res.json({
                        success: true,
                        result: finaldata
                    })
                }, function(error) {
                    return res.status(404).send({
                        success: false,
                        error: appMessage.common.error.dataNotFound
                    });
                })
            }, function(error) {
                return res.status(404).send({
                    success: false,
                    error: appMessage.common.error.dataNotFound
                });
            })
        } else if (typeof postData.productId != 'undefined' && postData.productId != '' && postData.productId.length != 0 && (typeof postData.dealId == 'undefined' || postData.dealId == '' || postData.dealId.length == 0)) {
            productData(req, res).then(function(data) {
                return res.json({
                    success: true,
                    result: data.result
                })
            }, function(error) {
                return res.status(404).send({
                    success: false,
                    error: appMessage.common.error.dataNotFound
                });
            })
        } else if ((typeof postData.productId == 'undefined' || postData.productId == '' || postData.productId.length == 0) && typeof postData.dealId != 'undefined' && postData.dealId != '' && postData.dealId.length != 0) {
            dealData(req, res).then(function(data) {
                return res.json({
                    success: true,
                    result: data.result
                })
            }, function(error) {
                return res.status(404).send({
                    success: false,
                    error: appMessage.common.error.dataNotFound
                });
            })
        }
    }
}

function productData(req, res) {
    return new Promise(function(resolve, reject) {
        var productId = req.body.productId;
        var postData = req.body;
        //Image magic for resize image
        var width = 300;
        if (typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH + "?width=" + width + "&pic=";
        //to get inactive products
        models.products.findAll({
            where: {
                id: postData.productId,
            },
            include: [{
                attributes: ['id', 'name'],
                model: models.productcategory,
                required: false
            }, {
                attributes: ['id', 'businessName'],
                model: models.vendordetails,
                required: false,
                include: [{
                    attributes: ['keyName', 'values'],
                    model: models.vendorconfig,
                    required: false
                }]
            }],
            required: false,
        }).then(function(data) {
            if (typeof data != 'undefined' && data != '' && data != null) {
                var resData = [];
                //Image resize function call
                for (var i = 0; i < data.length; i++) {
                    var configObj = data[i].vendordetail.vendorconfigs.find(o => o.keyName === 'minDelTime');
                    var product = {
                        "id": data[i].id,
                        "name": data[i].name,
                        "image": (data[i].image != "") ? resizeFunUrl + encodeURIComponent(data[i].image) : "",
                        "shortDesc": data[i].shortDesc,
                        "longDesc": data[i].longDesc,
                        "price": data[i].price,
                        "isActive":data[i].isActive,
                        "isDelete":data[i].isDelete,
                        "createdOn": data[i].createdOn,
                        "productcategory": {
                            "id": data[i].productcategory.id,
                            "name": data[i].productcategory.name,
                        },
                        "minDelTime": configObj.values,
                        isDeal: 0
                    };
                    resData[i] = product;
                }
                return resolve({

                    result: resData
                });
            } else {
                return reject({
                    success: false,
                    error: appMessage.product.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    })
}

function dealData(req, res) {
    return new Promise(function(resolve, reject) {
        var dealId = req.body.dealId;
        var postData = req.body;
        //Image magic for resize image
        var width = 300;
        if (typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH + "?width=" + width + "&pic=";
        //to get inactive products
        models.deals.findAll({
            where: {
                id: postData.dealId,
            },
            include: [{
                model: models.products,
                attributes: ['id', 'name', 'image', 'shortDesc', 'longDesc', 'price'],
                include: [{
                    attributes: ['name'],
                    model: models.productcategory,
                    required: false
                }, {
                    attributes: ['id', 'businessName'],
                    model: models.vendordetails,
                    required: false,
                    include: [{
                        attributes: ['keyName', 'values'],
                        model: models.vendorconfig,
                        required: false
                    }]
                }]
            }],
        }).then(function(data1) {
            if (typeof data1 != 'undefined' && data1 != '' && data1 != null) {
                var resData1 = [];
                //Image resize function call
                for (var i = 0; i < data1.length; i++) {
                    var configObj = data1[i].products[0].vendordetail.vendorconfigs.find(o => o.keyName === 'minDelTime');
                    var deal = {
                        "id": data1[i].id,
                        "name": data1[i].name,
                        "price": data1[i].price,
                        "createdOn": data1[i].createdOn,
                        "isActive":data1[i].isActive,
                        "isDelete":data1[i].isDelete,
                        "image": (data1[i].image != "") ? resizeFunUrl + encodeURIComponent(data1[i].image) : "",
                        "shortDesc": data1[i].shortDesc,
                        "longDesc": data1[i].longDesc,
                        "minDelTime": configObj.values,
                        isDeal: 1
                    };
                    resData1[i] = deal;
                }
                return resolve({
                    success: true,
                    result: resData1
                });
            } else {
                return reject(404).send({
                    success: false,
                    error: appMessage.deals.error.dealsDataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    })
}
    



    