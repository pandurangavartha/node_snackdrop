module.exports = {
    /*
     * Sequelize library function to save
     * return promise resolve,reject
     */

    save: function(modelSchema) {
        return new Promise(function(resolve, reject) {
            modelSchema.create().then(function(schemaData) {
                // resolve({
                //  data : schemaData
                // });
                resolve(schemaData);
            }).catch(function(error) {
                var errorMsg = {};
                if (!_.isEmpty(error)) {
                    errorMsg = error.toJSON();
                }
                var errResponse = {};
                var httpstatus = '400'
                if (error.code == '11000') {
                    errorMsg.fieldName = helper.parseUniqueFieldError(error);
                    errorMsg.msg = helper.parseUniqueFieldError(error) + ' ' + appMessage.common.error.unique.msg;
                    var httpstatus = '409'
                    errResponse = helper.parseUniqueFieldError(error) + ' ' + appMessage.common.error.unique.msg;
                }
                reject({
                    httpstatus: httpstatus,
                    msg: errResponse
                });
            });
        })
    },
    /*
     * Sequelize library function for bulk save
     * return promise resolve,reject
     */

    bulkSave: function(modelName, modelData) {
        return new Promise(function(resolve, reject) {            
            models[modelName].bulkCreate(modelData).then(function(docs) {
                resolve({
                    data: docs
                });
            }).catch(function(err) {
                reject({
                    error: err
                });
            });
        })
    },
    /*
     * Sequelize library function to fetch single record based on condition and fields
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    findOne: function(modelName, condition, fields) {
        return new Promise(function(resolve, reject) {
            if (fields !== '') {
                var promise = modelName.findOne({where:condition, attributes:fields});
            } else {
                var promise = modelName.findOne({where:condition});
            }

            promise.then(function(data) {
                if (data !== null) {
                    resolve({
                        data: data
                    });
                } else {
                    reject({
                        httpstatus: 404,
                        msg: "No records available"
                    });
                }
            }).catch(function(error) {
                reject({
                    error: error
                });
            });
        })
    },
    /*
     * Sequelize library function to fetch record based on condition and fields
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    find: function(modelName, condition, fields) {
        return new Promise(function(resolve, reject) {
            if (fields !== '') {
                var promise = modelName.find({where:condition, attributes:fields});
            } else {
                var promise = modelName.find({where:condition});
            }

            promise.then(function(data) {
                if (data !== null) {
                    resolve({
                        data: data
                    });
                } else {
                    reject({
                        httpstatus: 404,
                        msg: "No records available"
                    });
                }
            }).catch(function(error) {
                reject({
                    error: error
                });
            });
        })
    },
    /*
     * Sequelize library function to update records based on condition.
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    update: function(modelName, condition, updateParams, unsetParams) {
        return new Promise(function(resolve, reject) {
            var setUnsetOption = {};
            if (typeof unsetParams != 'undefined') {
                setUnsetOption = { $set: updateParams, $unset: unsetParams };
            } else {
                setUnsetOption = { $set: updateParams };
            }
            modelName.findOneAndUpdate(condition, setUnsetOption, { new: true },
                function(error, data) {
                    if (error) {
                        reject({
                            error: error
                        });
                    } else {
                        if (data !== null) {
                            resolve({
                                data: data
                            });
                        } else {
                            reject({
                                httpstatus: 404,
                                msg: "No records available"
                            });
                        }
                    }
                });

        });
    },
    softDelete: function(modelName, condition) {
        return new Promise(function(resolve, reject) {
            if (typeof condition != 'undefined') {
                modelName.findOneAndUpdate(condition, setUnsetOption, { new: true },
                function(error, data) {
                    if (error) {
                        reject({
                            error: error
                        });
                    } else {
                        if (data !== null) {
                            resolve({
                                data: data
                            });
                        } else {
                            reject({
                                httpstatus: 404,
                                msg: "No records available"
                            });
                        }
                    }
                });
            }
        });
    }    
}
