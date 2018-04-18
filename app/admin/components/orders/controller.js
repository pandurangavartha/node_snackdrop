var emptyBuffer = Buffer(0);
var asyncLoop = require("node-async-loop");
var _u = require('underscore')
const Op = Sequelize.Op;
module.exports = {
    /**
     * @desc Get List of Orders based on vendor id and based on superAdmin
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function(req, res) {
        var timestamp = req.body.timestamp;
        var stadiumWhere = {
            isActive: 1,
            isDelete: 0
        };
        var zoneWhere = {};
        var wherecondtion = {};
        var vendorWhere = {};
        var productWhere = {};
        //Set where condition with timestamp
        if (typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {
                $lt: timestamp
            };
        }
        //filter based on stadium name
        if (typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            stadiumWhere.name = {
                $like: "%" + req.body.stadiumName + "%"
            };
        }
        //filter based on business Name
        if (typeof req.body.businessName != 'undefined' && req.body.businessName != '' && req.body.businessName != null) {
            vendorWhere.businessName = {
                $like: "%" + req.body.businessName + "%"
            };
        }
        //filter based on Zone name
        if (typeof req.body.zoneName != 'undefined' && req.body.zoneName != '' && req.body.zoneName != null) {
            zoneWhere.zoneName = {
                $like: "%" + req.body.zoneName + "%"
            };
        }
        //filter based on Row
        if (typeof req.body.row != 'undefined' && req.body.row != '' && req.body.row != null) {
            wherecondtion.row = {
                $like: "%" + req.body.row + "%"
            };
        }
        //filter based on order Id
        if (typeof req.body.id != 'undefined' && req.body.id != '' && req.body.id != null) {
            wherecondtion.id = {
                $eq: req.body.id
            };
        }
        //filter based on seat
        if (typeof req.body.seatNumber != 'undefined' && req.body.seatNumber != '' && req.body.seatNumber != null) {
            wherecondtion.seatNumber = {
                $like: "%" + req.body.seatNumber + "%"
            };
        }
        if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
            productWhere.vendorDetailsId = req.body.vendorId
        }
        //get data
        models.orders.findAll({
            attributes: ['id', 'createdOn', 'row', 'seatNumber', 'totalPrice', 'deliveryCharge',
                'grandTotal', 'userId', 'stadiumId', 'zoneId', 'subzoneId'
            ],
            where: wherecondtion,
            order: "createdOn ASC",
            limit: 200,
            include: [{
                where: stadiumWhere,
                attributes: ['id', 'name'],
                model: models.stadiums,
            }, {
                where: zoneWhere,
                attributes: ['id', 'zoneName'],
                model: models.zones,
                as: 'zones'
            }, {
                attributes: ['id', 'zoneName'],
                model: models.zones,
                as: 'subzones'
            }, {
                attributes: ['id', 'name'],
                model: models.users,
            }, {
                attributes: ['id', 'price', 'quantity'],
                model: models.orderitems,
                required: false,
                include: [{
                    where: productWhere,
                    model: models.products,
                    required: false,
                    attributes: ['id', 'name', 'image', 'shortDesc', 'vendorDetailsId'],
                    include: [{
                        where: vendorWhere,
                        model: models.vendordetails,
                        required: false,
                        attributes: ['id', 'businessName', 'userId'],
                        include: [{
                            required: false,
                            model: models.users,
                            attributes: ['id', 'email', 'name'],
                            as: 'vendorUser',
                        }],
                    }],
                }, {
                    attributes: ['id', 'name'],
                    model: models.status,
                }]
            }, {
                model: models.orderdealsitems,
                required: false,
                attributes: ['id'],
                include: [{
                    attributes: ['id', 'name'],
                    model: models.deals,
                    group: ['products.id'],
                    include: [{
                        where: productWhere,
                        model: models.products,
                        required: false,
                        attributes: ['vendorDetailsId'],
                        include: [{
                            where: vendorWhere,
                            model: models.vendordetails,
                            required: false,
                            attributes: ['id', 'businessName', 'userId'],
                            include: [{
                                required: false,
                                model: models.users,
                                attributes: ['id', 'email', 'name'],
                                as: 'vendorUser'
                            }],
                        }],
                    }],

                }, {
                    attributes: ['id', 'name'],
                    model: models.status,
                }],
            }],
        }).then(function(data) {
            var resData = [];
            _.each(data, function(eachdata, key) {
                var mergedata = [];
                _.each(eachdata.orderitems, function(each) {
                    if (each.product != null) {
                        mergedata.push(each)
                    }
                })
                _.each(eachdata.orderdealsitems, function(each1) {
                    if (each1.deal.products.length != null && each1.deal.products.length != 0) {
                        mergedata.push(each1)
                    }
                })
                delete eachdata.dataValues.orderitems
                delete eachdata.dataValues.orderdealsitems
                eachdata.dataValues.orders = mergedata
                if (mergedata.length == 0) {
                    delete eachdata.dataValues
                } else {
                    resData.push(eachdata.dataValues)
                }
            })
            if (data !== null) {
                var countWhere = {};
                if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
                    countWhere.vendorDetailsId = req.body.vendorId
                }
                models.orders.findAll({
                    distinct: true,
                    include: [{
                        model: models.orderitems,
                        where: {
                            $or: [{
                                statusId: [1, 2]
                            }],
                        },
                        include: [{
                            model: models.products,
                            where: countWhere,
                        }]
                    }],

                }).then(function(itemData) {
                    models.orders.findAll({
                        distinct: true,
                        include: [{
                            model: models.orderdealsitems,
                            where: {
                                $or: [{
                                    statusId: [1, 2]
                                }],
                            },
                            include: [{
                                model: models.deals,
                                include: [{
                                    model: models.products,
                                    where: countWhere,
                                }]
                            }]
                        }]
                    }).then(function(dealData) {
                        var totalItemCount = [];
                        _.each(itemData, function(eachItem) {
                            totalItemCount.push(eachItem.id)
                        })
                        var totalDealCount = [];
                        _.each(dealData, function(eachDeal) {
                            totalItemCount.push(eachDeal.id)
                        })
                        return res.json({
                            success: true,
                            results: resData,
                            Count: _.uniq(totalItemCount).length,
                        });
                    });
                });
            } else {
                return res.status(404).send({
                    message: appMessage.orders.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },

    /**
     * @desc Change Order status
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    changeOrderStatus: function(req, res) {
        var postData = req.body;
        var orderId = req.params.orderId;
        var vendorDetailsId = req.body.vendorId;
        var wherecondtion = {};
        if (typeof req.body.id != 'undefined' && req.body.id != '' && req.body.id != null) {
            wherecondtion.id = {
                $eq: req.body.id
            };
        }
        models.orders.findAll({
            attributes: ['id'],
            where: wherecondtion,
            include: [{
                attributes: ['id'],
                model: models.orderitems,
                required: false,
                include: [{
                    where: {
                        vendorDetailsId: vendorDetailsId
                    },
                    model: models.products,
                    required: false,
                    attributes: ['id', 'vendorDetailsId']
                }]
            }, {
                model: models.orderdealsitems,
                required: false,
                attributes: ['id'],
                include: [{
                    attributes: ['id', 'name'],
                    model: models.deals,
                    group: ['products.id'],
                    include: [{
                        where: {
                            vendorDetailsId: vendorDetailsId
                        },
                        model: models.products,
                        required: false,
                        attributes: ['vendorDetailsId']
                    }],
                }],
            }],
        }).then(function(data) {
            if (data.length) {
                var orderslist = []
                var dealslist = []
                _.each(data, function(eachdata, key) {
                    _.each(eachdata.orderitems, function(each) {
                        if (each.product != null) {
                            orderslist.push(each.id)
                        }
                    })
                    _.each(eachdata.orderdealsitems, function(each1) {
                        if (each1.deal.products.length != null && each1.deal.products.length != 0) {
                            dealslist.push(each1.id)
                        }
                    })
                })
                var updateCondition = {
                    statusId: req.body.statusId
                }
                models.orderitems.update(updateCondition, {
                    where: {
                        id: orderslist
                    }
                }).then(function(result1) {
                    models.orderdealsitems.update(updateCondition, {
                        where: {
                            id: dealslist
                        }
                    }).then(function(result) {
                        //Notification//
                        if (postData.statusId == 2 || postData.statusId == 3) {
                            models.orderitems.findAll({
                                where: {
                                    orderId: req.body.id
                                }
                            }).then(function(itemsTable) {
                                models.orderdealsitems.findAll({
                                    where: {
                                        orderId: req.body.id
                                    }
                                }).then(function(dealsTable) {
                                    var pushitems = false;
                                    var pushdeals = false
                                    var a = 0
                                    _.each(itemsTable, function(items) {
                                        if (items.statusId == postData.statusId) {
                                            a++
                                        }
                                    })
                                    if (itemsTable.length == a) {
                                        pushitems = true
                                    }
                                    var b = 0
                                    _.each(dealsTable, function(dealsdata) {
                                        if (dealsdata.statusId == postData.statusId) {
                                            b++
                                        }
                                    })
                                    if (dealsTable.length == b) {
                                        pushdeals = true
                                    }
                                    if (pushitems && pushdeals) {
                                        models.orders.findOne({
                                            where: {
                                                id: req.body.id
                                            }
                                        }).then(function(data) {
                                            models.customerdetails.findOne({
                                                where: {
                                                    userId: data.userId
                                                }
                                            }).then(function(tokendata) {
                                                var msg
                                                if (postData.statusId == 2) {
                                                    msg = 'your order is out for delivery'
                                                } else {
                                                    msg = 'your order is delivered'
                                                }
                                                var orderData = [];
                                                orderData['orderId'] = req.body.id
                                                var tokensArray = []
                                                tokensArray.push(tokendata.deviceToken)
                                                notification.sendNotification(tokensArray, orderData, msg).then(function(DATA) {
                                                    res.json({
                                                        result: "Order status Updated",
                                                        success: true,
                                                    })
                                                }, function(err) {
                                                    res.end()
                                                });
                                            })
                                        })
                                    } else {
                                        res.json({
                                            result: "Order status Updated",
                                            success: true,
                                        })
                                    }
                                })
                            })
                        }
                    })
                })
            } else {
                return res.json({
                    success: false,
                    results: "No items to update",
                    data: data
                });
            }
        })
    },

    /**
     * @desc Get List of Transaction Details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getTransactionDetails: function(req, res) {
        var timestamp = req.body.timestamp;
        var stadiumWhere = {
            isActive: 1,
            isDelete: 0
        };
        var zoneWhere = {};
        var wherecondtion = {};
        var vendorWhere = {};
        var productWhere = {};
        //Set where condition with timestamp
        if (typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {
                $lt: timestamp
            };
        }
        //filter based on stadium name
        if (typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            stadiumWhere.name = {
                $like: "%" + req.body.stadiumName + "%"
            };
        }
        //filter based on business Name
        if (typeof req.body.businessName != 'undefined' && req.body.businessName != '' && req.body.businessName != null) {
            vendorWhere.businessName = {
                $like: "%" + req.body.businessName + "%"
            };
        }
        //filter based on Zone name
        if (typeof req.body.zoneName != 'undefined' && req.body.zoneName != '' && req.body.zoneName != null) {
            zoneWhere.zoneName = {
                $like: "%" + req.body.zoneName + "%"
            };
        }
        //filter based on seat
        if (typeof req.body.seatNumber != 'undefined' && req.body.seatNumber != '' && req.body.seatNumber != null) {
            wherecondtion.seatNumber = {
                $like: "%" + req.body.seatNumber + "%"
            };
        }
        //filter based on Row
        if (typeof req.body.row != 'undefined' && req.body.row != '' && req.body.row != null) {
            wherecondtion.row = {
                $like: "%" + req.body.row + "%"
            };
        }
        if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
            productWhere.vendorDetailsId = req.body.vendorId
        }
        //get data
        models.orders.findAll({
            attributes: ['id', 'createdOn', 'row', 'seatNumber', 'totalPrice', 'deliveryCharge',
                'grandTotal', 'userId', 'stadiumId', 'zoneId', 'subzoneId'
            ],
            where: wherecondtion,
            order: "createdOn ASC",
            limit: 200,
            include: [{
                where: stadiumWhere,
                attributes: ['id', 'name'],
                model: models.stadiums,
            }, {
                where: zoneWhere,
                attributes: ['id', 'zoneName'],
                model: models.zones,
                as: 'zones'
            }, {
                attributes: ['id', 'zoneName'],
                model: models.zones,
                as: 'subzones'
            }, {
                attributes: ['id', 'price', 'quantity'],
                model: models.orderitems,
                required: false,
                include: [{
                    where: productWhere,
                    model: models.products,
                    required: false,
                    attributes: ['id', 'name', 'image', 'shortDesc', 'vendorDetailsId'],
                    include: [{
                        where: vendorWhere,
                        model: models.vendordetails,
                        required: false,
                        attributes: ['id', 'businessName', 'userId'],
                        include: [{
                            model: models.vendorconfig,
                            attributes: ['id', 'keyName', 'values'],
                        }, {
                            required: false,
                            model: models.users,
                            attributes: ['id', 'email', 'name'],
                            as: 'vendorUser',
                        }]
                    }],
                }]
            }, {
                model: models.orderdealsitems,
                required: false,
                attributes: ['id'],
                include: [{
                    attributes: ['id', 'name'],
                    model: models.deals,
                    group: ['products.id'],
                    include: [{
                        where: productWhere,
                        model: models.products,
                        required: false,
                        attributes: ['vendorDetailsId'],
                        include: [{
                            where: vendorWhere,
                            model: models.vendordetails,
                            required: false,
                            attributes: ['id', 'businessName', 'userId'],
                            include: [{
                                model: models.vendorconfig
                            }, {
                                required: false,
                                model: models.users,
                                attributes: ['id', 'email', 'name'],
                                as: 'vendorUser',
                            }]
                        }],
                    }],

                }],
            }],
        }).then(function(data) {
            var resData = [];
            _.each(data, function(eachdata, key) {
                var mergedata = [];
                _.each(eachdata.orderitems, function(each) {
                    if (each.product != null) {
                        mergedata.push(each)
                    }
                })
                _.each(eachdata.orderdealsitems, function(each1) {
                    if (each1.deal.products.length != null && each1.deal.products.length != 0) {
                        mergedata.push(each1)
                    }
                })
                delete eachdata.dataValues.orderitems
                delete eachdata.dataValues.orderdealsitems
                eachdata.dataValues.orders = mergedata
                if (mergedata.length == 0) {
                    delete eachdata.dataValues
                } else {
                    resData.push(eachdata.dataValues)
                }
            })
            if (data !== null) {
                var countWhere = {};
                if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
                    countWhere.vendorDetailsId = req.body.vendorId
                }
                models.orders.findAll({
                    distinct: true,
                    include: [{
                        model: models.orderitems,
                        include: [{
                            model: models.products,
                            where: countWhere,
                        }]
                    }],

                }).then(function(itemData) {
                    models.orders.findAll({
                        distinct: true,
                        include: [{
                            model: models.orderdealsitems,
                            include: [{
                                model: models.deals,
                                include: [{
                                    model: models.products,
                                    where: countWhere,
                                }]
                            }]
                        }]
                    }).then(function(dealData) {
                        var totalItemCount = [];
                        _.each(itemData, function(eachItem) {
                            totalItemCount.push(eachItem.id)
                        })
                        var totalDealCount = [];
                        _.each(dealData, function(eachDeal) {
                            totalItemCount.push(eachDeal.id)
                        })
                        return res.json({
                            success: true,
                            results: resData,
                            Count: _.uniq(totalItemCount).length,
                        });
                    });
                });
            } else {
                return res.status(404).send({
                    message: appMessage.orders.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Get order history
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getOrderHistory: function(req, res) {
        var timestamp = req.body.timestamp;
        var productWhere = {};
        var stadiumWhere = {};
        var zoneWhere = {};
        var wherecondtion = {};
        //Set where condition with timestamp
        if (typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {
                $lt: timestamp
            };
        }
        //filter based on stadium name
        if (typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            stadiumWhere.name = {
                $like: "%" + req.body.stadiumName + "%"
            };
        }
        if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
            productWhere.vendorDetailsId = req.body.vendorId
        }
        //filter based on Zone name
        if (typeof req.body.zoneName != 'undefined' && req.body.zoneName != '' && req.body.zoneName != null) {
            zoneWhere.zoneName = {
                $like: "%" + req.body.zoneName + "%"
            };
        }
        //get data
        models.orders.findAll({
            attributes: ['id', 'createdOn', 'row', 'seatNumber', 'totalPrice', 'deliveryCharge',
                'grandTotal', 'userId', 'stadiumId', 'zoneId', 'isDelete'
            ],
            order: "createdOn ASC",
            limit: 200,
            include: [{
                where: stadiumWhere,
                attributes: ['id', 'name'],
                model: models.stadiums,
            }, {
                where: zoneWhere,
                attributes: ['id', 'zoneName'],
                model: models.zones,
                as: 'zones'
            }, {
                attributes: ['id', 'price', 'quantity'],
                model: models.orderitems,
                required: false,
                where: {
                    statusId: 3,
                    isActive: 0
                },
                include: [{
                    where: productWhere,
                    model: models.products,
                    required: false,
                    attributes: ['id', 'name', 'image', 'shortDesc', 'vendorDetailsId'],
                    include: [{
                        model: models.vendordetails,
                        required: false,
                        attributes: ['id', 'businessName', 'userId'],
                    }],
                }]
            }, {
                model: models.orderdealsitems,
                required: false,
                where: {
                    statusId: 3,
                    isActive: 0
                },
                attributes: ['id'],
                include: [{
                    attributes: ['id', 'name'],
                    model: models.deals,
                    group: ['products.id'],
                    include: [{
                        where: productWhere,
                        model: models.products,
                        required: false,
                        attributes: ['vendorDetailsId'],
                        include: [{
                            model: models.vendordetails,
                            required: false,
                            attributes: ['id', 'businessName', 'userId'],
                        }],
                    }],

                }],
            }],
        }).then(function(data) {
            var resData = [];
            _.each(data, function(eachdata, key) {
                var mergedata = [];
                _.each(eachdata.orderitems, function(each) {
                    if (each.product != null) {
                        mergedata.push(each)
                    }
                })
                _.each(eachdata.orderdealsitems, function(each1) {
                    if (each1.deal.products.length != null && each1.deal.products.length != 0) {
                        mergedata.push(each1)
                    }
                })
                delete eachdata.dataValues.orderitems
                delete eachdata.dataValues.orderdealsitems
                eachdata.dataValues.orders = mergedata
                if (mergedata.length == 0) {
                    delete eachdata.dataValues
                } else {
                    resData.push(eachdata.dataValues)
                }
            })
            if (data !== null) {
                var countWhere = {};
                if (typeof req.body.vendorId != 'undefined' && req.body.vendorId != '' && req.body.vendorId != null) {
                    countWhere.vendorDetailsId = req.body.vendorId
                }
                models.orders.findAll({
                    distinct: true,
                    include: [{
                        model: models.orderitems,
                        where: {
                            statusId: 3,
                            isActive:0
                        },
                        include: [{
                            model: models.products,
                            where: countWhere,
                        }]
                    }],

                }).then(function(itemData) {
                    models.orders.findAll({
                        distinct: true,
                        include: [{
                            model: models.orderdealsitems,
                            where: {
                                statusId: 3,
                                 isActive:0
                            },
                            include: [{
                                model: models.deals,
                                include: [{
                                    model: models.products,
                                    where: countWhere,
                                }]
                            }]
                        }]
                    }).then(function(dealData) {
                        var totalItemCount = [];
                        _.each(itemData, function(eachItem) {
                            totalItemCount.push(eachItem.id)
                        })
                        var totalDealCount = [];
                        _.each(dealData, function(eachDeal) {
                            totalItemCount.push(eachDeal.id)
                        })
                        return res.json({
                            success: true,
                            results: resData,
                            Count: _.uniq(totalItemCount).length,
                        });
                    });
                });
            } else {
                return res.status(404).send({
                    message: appMessage.orders.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Delete Transaction - set isDelete:1 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    deleteHistory: function(req, res) {
        var postData = req.body;
        var updateCondition = {
            isActive: postData.isActive
        }
        models.orderitems.update(updateCondition, {
            where: {
                id: postData.itemid
            }
        }).then(function() {
            models.orderdealsitems.update(updateCondition, {
                where: {
                    id: postData.dealid
                }
            }).then(function() {
                return res.json({
                    success: true,
                    message: appMessage.order.success.dataDeleted,
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