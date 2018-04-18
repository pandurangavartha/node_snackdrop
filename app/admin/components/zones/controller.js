
/**
 * @desc Stadium-Zones Controller
 */
module.exports = {
    /**
     * @desc Get List of Zones based on stadium id
     * Search with name
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
        var timestamp = req.body.timestamp;
        var stadiumId = req.params.stadiumId;
        //Set default where condition
        var wherecondtion = { stadiumId : stadiumId,isDelete:0};
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        if(typeof req.body.name != 'undefined' && req.body.name != '' && req.body.name != null) {
            wherecondtion.zoneName = {$like : "%"+req.body.name+"%"};
        }
        if(typeof req.body.seats != 'undefined' && req.body.seats != '' && req.body.seats != null) {
            wherecondtion.seats = {$like : "%"+req.body.seats+"%"};
        }
        models.zones.findAll({
            attributes: ['id','stadiumId','zoneName','seats','isActive','isDelete','createdOn','updatedOn','parentZoneId'],
            where : wherecondtion,
            include : [
                {
                    attributes : ['id', 'name'],
                    model : models.stadiums
                },
                {
                    model: models.zones,
                    as: 'subzones',
                    attributes: ['id', 'zoneName'],
                    required: false
                },                       
            ],
            required : false,
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data,
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.zone.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });       
    },
    /**
     * @desc Get List of Parent Zones based on stadium id
     * Search with name
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getParentZoneList: function (req, res) {
        var stadiumId = req.params.stadiumId;
        //Set default where condition
        var wherecondtion = { stadiumId : stadiumId,isDelete:0,parentZoneId:null};        
        models.zones.findAll({
            attributes: ['id','stadiumId','zoneName','seats','isActive','createdOn'],
            where : wherecondtion,
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.zone.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });       
    },
    /**
     * @desc Get Zone Details based on zone id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {        
        var zoneId = req.params.id;
        models.zones.findOne({
            attributes: ['id','zoneName','seats','isActive','isDelete','createdOn','updatedOn','parentZoneId'],
            where : {id : zoneId},
            include : [
                {
                    attributes : ['id','name'],
                    model : models.stadiums
                },
                {
                    model: models.zones,
                    as: 'subzones',
                    attributes: ['id', 'zoneName'],
                    required: false
                },
            ],
            required : false
        }).then(function(data) {            
            if(data !== null) {
                var resData = {
                    id : data.id,
                    zoneName : data.zoneName,
                    seats : data.seats,
                    isActive : data.isActive,
                    isDelete : data.isDelete,
                    createdOn : data.createdOn,
                    updatedOn : data.updatedOn,
                    parentZoneId : data.parentZoneId,
                    stadium : data.stadium,
                    subzones : data.subzones,
                }
                if(data.parentZoneId != null) {
                    models.zones.findOne({
                        attribute : ['id','zoneName'],
                        where : {id : data.parentZoneId}
                    }).then(function(parentZone){
                        resData.parentZone = {'id':parentZone.id, zoneName:parentZone.zoneName};
                        return res.json({
                            success: true,
                            result: resData
                        });
                    }).catch(function(){
                        resData.parentZone = {};
                        return res.json({
                            success: true,
                            result: resData
                        });
                    })
                } else {
                    resData.parentZone = {};
                    return res.json({
                        success: true,
                        result: resData
                    });
                }
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.zone.error.dataNotFound,
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        }); 
    },
    /**
     * @desc Create New Zone under stadium
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create : function (req, res) {
        var data = req.body;
        var requiredParams = ['zoneName', 'stadiumId','seats'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var zoneData = {
                zoneName : data.zoneName,
                seats : data.seats,
                stadiumId : data.stadiumId,
                isActive:1,
                isDelete:0,
                createdBy : requestUserId,
                updatedBy : requestUserId,
            }
            if(typeof data.parentZoneId != 'undefined' && data.parentZoneId != '' && data.parentZoneId != null) {
                zoneData.parentZoneId = data.parentZoneId;
            }
            //save data
            models.zones.create(zoneData).then(function(result) {
                return res.json({
                    success: true,
                    message : appMessage.zone.success.dataAdded,
                    result: result
                });
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).send(err.errors);
            }).catch(function(error) {
                return res.status(400).send({
                    success: false,
                    message: error.message
                });
            })
        });
    },
    /**
     * @desc Udpate Zone details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        var zoneId = req.params.id;
        var data = req.body;
        models.zones.findOne({
            where : {id : zoneId},
        }).then(function(zone) {            
            zone.zoneName = data.zoneName;
            zone.seats = data.seats;
            zone.updatedBy = requestUserId;
            
            if(typeof data.parentZoneId != 'undefined' && data.parentZoneId != '' && data.parentZoneId != null) {
                zone.parentZoneId = data.parentZoneId;
            }
            //save data
            zone.save().then(function(result) {
                return res.json({
                    success: true,
                    result : result,
                    message: appMessage.zone.success.dataUpdated,
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
     * @desc Delete Zone details : soft delete
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {
        var zoneId = req.params.id;
        var postData = req.body;
        models.zones.findOne({
            where: {id: zoneId},
        }).then(function(zone) {
            zone.isDelete = postData.isDelete;
            zone.id = postData.id;
            zone.save().then(function(result) {
                models.vendorzones.update({
                     isActive: 0
                    }, {
                    where: {id: zoneId}
                }).then(function(data1) {
                        return res.json({
                        success: true,
                        message: appMessage.zone.success.dataDeleted,
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
    }
}