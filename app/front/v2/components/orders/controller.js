/**
 * @desc Order APIs controller
 */
module.exports = {
    /**
     * @desc Place Order
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    placeOrder: function (req, res) {
        var postData = req.body;
        var orderItemsData = postData.orderItems;
        var orderData = {
            stadiumId: postData.stadiumId,
            row: postData.row,
            seatNumber: postData.seatNumber,
            totalPrice: postData.totalPrice,
            deliveryCharge: postData.deliveryCharge,
            grandTotal: postData.grandTotal
        }
        //Set zondeID if its available
        if (typeof postData.zoneId != 'undefined' && postData.zoneId != '' && postData.zoneId != null) {
            orderData.zoneId = postData.zoneId;
        }
        //Set subZondeID if its available
        if (typeof postData.subZoneId != 'undefined' && postData.subZoneId != '' && postData.subZoneId != null) {
            orderData.subZoneId = postData.subZoneId;
        }
        if (typeof req.decoded != 'undefined' && req.decoded.userId != '' && req.decoded.userId != null) {
            orderData.userId = req.decoded.userId;
        }
        
        //add data to order table
        models.orders.create(orderData).then(function (data) {
            //after adding order data add order items or deal items
            var productItems = [];
            var dealsItems = [];
            for (var i = 0; i < orderItemsData.length; i++) {
                var item = {
                    price: orderItemsData[i].price,
                    quantity: orderItemsData[i].quantity,
                    orderId: data.id,
                    statusId: 1
                }
                if (orderItemsData[i].isDeal == 0) {
                    item.productId = orderItemsData[i].id;
                    productItems.push(item);
                } else {
                    item.dealId = orderItemsData[i].id;
                    dealsItems.push(item);
                }
            }
            //Add order items and order deals items to table
            async.parallel({
                insertProductItems: function (callback) {
                    //Add product items to orderitems
                    if (productItems.length > 0) {
                        models.orderitems.bulkCreate(productItems).then(function (data) {
                            callback(null, data);
                        }).catch(function (error) {
                           callback(new Error(error));
                        });
                    } else {
                        callback();
                    }
                },
                insertDealsItems: function (callback) {
                    //Add deals items to orderdealsitems
                    if (dealsItems.length > 0) {
                        models.orderdealsitems.bulkCreate(dealsItems).then(function (data) {
                            callback(null, data);
                        }).catch(function (error) {
                            callback(new Error(error));
                        });
                    } else {
                        callback();
                    }
                }
            }, function (err, results) {
                if(err) {
                    models.orders.destroy({where:{id : data.id}}).then(function() {
                        return res.status(400).json({
                            success : false,
                            error : appMessage.common.error.payloadError
                        });
                    });                    
                } else {
                    return res.json({
                        success : true,
                        orderId : data.id,
//                        results : results,
                        message : appMessage.order.success.dataAdded
                    });
                }
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).json({
                success: false,
                error: err.errors[0].message
            });
        }).catch(function (error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Get List of Orders
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    orderList: function (req, res) {
        var timestamp = req.body.timestamp;
        //Set default where condition
        var wherecondtion = {userId : req.decoded.userId};
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        var width = 300;
        if(typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        //get orders list
        models.orders.findAll({
            attributes : ['id','createdOn','totalPrice','deliveryCharge','grandTotal'],
            where : wherecondtion,
            order :"createdOn DESC",
            limit : 10,
            include :[{
                    attributes : ['id','price','quantity'],
                    model : models.orderitems,
                    required : false,
                    include : [{
                            attributes : ['id','name','image','shortDesc','vendorDetailsId'],
                            model : models.products,
                    },{
                            attributes : ['id','name'],
                            model : models.status,
                    }]
            },{
                    model : models.orderdealsitems,
                    required : false,
                    include : [{
                            attributes : ['id','name','image','shortDesc'],
                            model : models.deals,
                            include : [{
                                    attributes : ['vendorDetailsId'],
                                    model : models.products
                            }]
                    },{
                            attributes : ['id','name'],
                            model : models.status,
                    }]
            }],
        }).then(function(orderData){
            if (typeof orderData != 'undefined' && orderData != '' && orderData != null) {                
                var resData = [];
                //Image resize function call
                for(var i = 0; i < orderData.length;i++) {
                    var itemsAr = orderData[i].orderitems.concat(orderData[i].orderdealsitems);
                    var orderItem = {
                        "id": orderData[i].id,
                        "createdOn": orderData[i].createdOn,
                        "totalPrice": orderData[i].totalPrice,
                        "deliveryCharge": orderData[i].deliveryCharge,
                        "grandTotal": orderData[i].grandTotal,
                        "totalItems" : itemsAr.length
                    };
                    var items = [];
                    for(var j=0;j<itemsAr.length;j++) {
                        if(typeof itemsAr[j].product != 'undefined' && itemsAr[j].product != '' && itemsAr[j].product != null) {
                            var itemObj = {
                                itemId : itemsAr[j].id,
                                name : itemsAr[j].product.name,
                                image : (itemsAr[j].product.image != "") ? resizeFunUrl+encodeURIComponent(itemsAr[j].product.image) : "",
                                vendorDetailsId : itemsAr[j].product.vendorDetailsId,
                                shortDesc : itemsAr[j].product.shortDesc,
                                price : itemsAr[j].price,
                                createdOn: orderData[i].createdOn,
                                status : itemsAr[j].status,
                                isDeal : 0,
                            };
                            items[j] = itemObj;
                        }
                        if(typeof itemsAr[j].deal != 'undefined' && itemsAr[j].deal != '' && itemsAr[j].deal != null) {
                            var dealItemObj = {
                                itemId : itemsAr[j].id,
                                name : itemsAr[j].deal.name,
                                image : (itemsAr[j].deal.image != "") ? resizeFunUrl+encodeURIComponent(itemsAr[j].deal.image) : "",
                                vendorDetailsId : itemsAr[j].deal.products[0].vendorDetailsId,
                                shortDesc : itemsAr[j].deal.shortDesc,
                                price : itemsAr[j].price,
                                createdOn: orderData[i].createdOn,
                                status : itemsAr[j].status,
                                isDeal : 1,
                            };
                            items[j] = dealItemObj;
                        }
                    }
                    orderItem.items = _.orderBy(items, ['itemId'], ['desc']);
                    resData[i] = orderItem;
                }                
                return res.json({
                    success: true,
                    result: resData
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.order.error.dataNotFound
                });
            }
        }).catch(function (error) {
            helper.formatResponse('', res, error);
        });        
    },
    /**
     * @desc Get Details of perticular Order by id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    orderDetails: function (req, res) {
        var orderId = req.query.orderId;
        //Get data with order id, status, vendors count
        var model = models.orders;
        //get data
        model.findOne({
          attributes: ['id', 'createdOn'],
            where: {
                orderId: orderId
            },
        }).then(function (data) {
            if (typeof data != 'undefined' && data != '' && data != null) {
                var resData = {
                    orderId : orderId,
                    status : data.status
                };
                //Get vendor count
                var productVendorCntQuery = "SELECT orderitems.orderId,products.vendorDetailsId \n\
                    FROM orderitems LEFT JOIN products ON orderitems.productId = products.id \n\
                    WHERE orderId="+orderId+" GROUP BY products.vendorDetailsId";
                var dealVendorCntQuery = "SELECT orderdealsitems.orderId, products.vendorDetailsId \n\
                    FROM orderdealsitems LEFT JOIN `deals` ON orderdealsitems.dealId = deals.id \n\
                    LEFT JOIN dealsproducts ON deals.id = dealsproducts.dealId \n\
                    LEFT JOIN products ON dealsproducts.productId = products.id \n\
                    WHERE orderId="+orderId+" GROUP BY products.vendorDetailsId";
                
                var query = "("+productVendorCntQuery+") UNION ("+dealVendorCntQuery+")";                
                sequelize.query(query,{
                    type: sequelize.QueryTypes.SELECT
                }).then(function(vendorCnt) {
                    resData.vendorCnt = vendorCnt.length;
                    return res.json({
                        success: true,
                        result: resData
                    });
                }).catch(function(err) {
                    resData.vendorCnt = 0;
                    return res.json({
                        success: true,
                        result: resData
                    });
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.order.error.dataNotFound
                });
            }
        }).catch(function (error) {
            helper.formatResponse('', res, error);
        });
    },
 
}
