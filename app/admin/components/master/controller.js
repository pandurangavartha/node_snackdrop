/*
 * @desc : performing basic CRUD on Mongoose schemas 
 */
/*Define the requires params for schemas with their schema Names */
var modelParams = {
    products: ['name', 'images'],
    users: ['name', 'email'],
    sample : [],
}
module.exports = {
    /*
     * function to save for different schemas of Mongoose 
     */

    save: function (req, res) {
        var requiredParams = ['modelName', 'data'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var modelName = req.body.modelName;
            requiredParams = modelParams[modelName];
            if (typeof requiredParams == 'undefined') {
                var error = {
                    httpstatus: 401,
                    msg: appMessage.common.error.invalidSchema.msg
                };
                helper.formatResponse('', res, error);
            } else {
                /*
                 * For required parameters to a Schema
                 * formatting the argument to validateRequiredParams function
                 * validation performs validation on req.body format only
                 */
                var modelData = {
                    body: req.body.data
                };
                helper.validateRequiredParams(modelData, res, requiredParams).then(function (response) {
                    var postData = req.body.data;
                    postData.createdBy = requestUserId;
                    postData.updatedBy = requestUserId;
                    var saveData = new models[modelName](postData);
                    saveData.save().then(function (schemaData) {
                        var response = [];
                        response.data = schemaData;
                        helper.formatResponse(response, res, '');
                    }).catch(function (error) {
                        var error = {
                            httpstatus: 200,
                            msg: appMessage.common.error.dataAdd.msg
                        };
                        helper.formatResponse('', res, error);
                    });
                });
            }
        });
    },
    /*
     * function to fetch single record based on condition and fields
     * fields parameter is not mandatory
     */

    findOne: function (req, res) {
        var requiredParams = ['modelName', 'data'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var modelName = req.body.modelName;
            requiredParams = modelParams[modelName];
            // checking the schema exists or not
            if (typeof requiredParams == 'undefined') {
                var error = {
                    httpstatus: 401,
                    msg: appMessage.common.error.invalidSchema.msg
                };
                helper.formatResponse('', res, error);
            } else {
                var condition = {
                    _id: req.params.id,
                    isDelete: false
                };
                modelName = models[modelName]
                if (typeof req.body.data.fields == 'undefined') {
                    var getData = modelName.findOne(condition);
                } else {
                    var fields = req.body.data.fields;
                    var getData = modelName.findOne(condition).select(fields);
                }
            }
            getData.exec().then(function (modelData) {
                if (modelData !== null) {
                    var response = [];
                    response.data = modelData;
                    helper.formatResponse(response, res, '');
                } else {
                    helper.formatResponse('', res, appMessage.common.error.dataNotFound);
                }
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        });
    },
    /*
     * Mongoose library function to fetch record based on condition and fields
     * fields parameter is not mandatory
     * return promise resolve,reject
     */
    find: function (req, res) {
        var modelName = req.params.modelName;
        var requiredParams = modelParams[modelName];
        // checking the schema exists or not
        if (typeof requiredParams == 'undefined') {
            var error = {
                httpstatus: 401,
                msg: appMessage.common.error.invalidSchema.msg
            };
            helper.formatResponse('', res, error);
        } else {
            modelName = models[modelName]
            var condition  = {
                isDelete : false
            }
            modelName.find(condition).exec().then(function (modelData) {
                if (modelData !== null) {
                    var response = [];
                    response.data = modelData;
                    helper.formatResponse(response, res, '');
                } else {
                    helper.formatResponse('', res, appMessage.common.error.dataNotFound);
                }
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        }

    },
    /*
     * Mongoose library function to update records based on condition.
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    update: function (req, res) {
        var requiredParams = ['modelName', 'data'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var modelName = req.body.modelName;
            requiredParams = modelParams[modelName];
            // checking the schema exists or not
            if (typeof requiredParams == 'undefined') {
                var error = {
                    httpstatus: 401,
                    msg: appMessage.common.error.invalidSchema.msg
                };
                helper.formatResponse('', res, error);
            } else {
                /*
                 * For required parameters to a Schema
                 * formatting the argument to validateRequiredParams function
                 * validation performs validation on req.body format only
                 */
                var modelData = {
                    body: req.body.data
                };
                helper.validateRequiredParams(modelData, res, requiredParams).then(function (response) {
                    var condition = {
                        _id: req.params.id,
                        isDelete: false
                    }
                    var updateData = req.body.data
                    updateData.updatedBy = requestUserId;
                    var setUnsetData = {
                        $set: updateData
                    }
                    modelName = models[modelName]
                    modelName.findOneAndUpdate(condition, setUnsetData, {new : true},
                            function (error, modelData) {
                                if (error) {
                                    helper.formatResponse('', res, error);
                                } else {
                                    if (modelData !== null) {
                                        var response = [];
                                        response.data = modelData;
                                        helper.formatResponse(response, res, '');
                                    } else {
                                        helper.formatResponse('', res, appMessage.common.error.dataNotFound);
                                    }
                                }
                            });
                });
            }
        });
    },
    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : change status
     */

    changeStatus: function (req, res) {
        var modelName = req.params.modelName;
        var requiredParams = modelParams[modelName];
        // checking the schema exists or not
        if (typeof requiredParams == 'undefined') {
            var error = {
                httpstatus: 401,
                msg: appMessage.common.error.invalidSchema.msg
            };
            helper.formatResponse('', res, error);
        } else {
            var activeStatus = req.params.status;
            var condition = {_id: req.params.id};
            var updateParams = {isActive: activeStatus};
            var modelName = models[modelName];
            modelName.update(condition, updateParams).then(function (data) {
                var response = {};
                response = data;
                helper.formatResponse(response, res, '');
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        }
    },
    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : soft delete 
     */

    delete: function (req, res) {
        var modelName = req.params.modelName;
        var requiredParams = modelParams[modelName];
        // checking the schema exists or not
        if (typeof requiredParams == 'undefined') {
            var error = {
                httpstatus: 401,
                msg: appMessage.common.error.invalidSchema.msg
            };
            helper.formatResponse('', res, error);
        } else {
            var condition = {_id: req.params.id};
            var updateParams = {isDelete: true};
            var modelName = models[modelName];
            modelName.update(condition, updateParams).then(function (data) {
                var response = {};
                response = data;
                helper.formatResponse(response, res, '');
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        }
    }
}