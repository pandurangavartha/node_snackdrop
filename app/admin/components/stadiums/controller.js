
/**
 * @desc Stadium Controller
 */
module.exports = {
    /**
     * @desc Get List of Stadiums
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
        var timestamp = req.body.timestamp;
        var name = req.body.name;
        //Set default where condition
        var wherecondtion = {isDelete: 0};
        //Set where condition with timestamp
        if (typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt: timestamp};
        }
        if (typeof name != 'undefined' && name != '' && name != null) {
            wherecondtion.name = {$like: "%" + name + "%"};
        }
        if (typeof req.body.address != 'undefined' && req.body.address != '' && req.body.address != null) {
            wherecondtion.address = {$like: "%" + req.body.address + "%"};
        }

        models.stadiums.findAll({
            attributes: ['id', 'name', 'image', 'address', 'latitude', 'longitude',
                'isActive', 'isDelete', 'createdOn'],
            where: wherecondtion,
            include: [{
                    attributes: ['id', 'zoneName'],
                    model: models.zones,
                    where: {isActive: 1, parentZoneId: null},
                    include: [{model: models.zones, as: 'subzones', attributes: ['id', 'zoneName'], required: false}],
                    required: false
                }],
            order: "createdOn DESC",
            limit: 50,
        }).then(function (data) {
            if (data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
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
     * @desc View Details of Stadium by Id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        models.stadiums.findOne({
            attributes: ['id', 'name', 'image', 'address', 'latitude', 'longitude',
                'isActive', 'isDelete', 'createdOn', 'updatedOn'],
            where: {id: req.params.id},
            include: [{
                    attributes: ['id', 'zoneName'],
                    model: models.zones,
                    where: {isActive: 1, parentZoneId: null},
                    include: [{model: models.zones, as: 'subzones', attributes: ['id', 'zoneName'], required: false}],
                    required: false
                }],
        }).then(function (data) {
            if (data !== null) {
                data.image = (data.image != '') ? data.image : ""
                return res.json({
                    success: true,
                    result: data
                });
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
     * @desc Add new stadium with details : name, image, address,
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    create: function (req, res) {
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
        image.mv(imageUploadPath + "stadiums/" + fileNewName, function (err) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    result: "Something went wrong, Please try again."
                });
            } else {
                var stadiumData = {
                    name: postData.name,
                    address: postData.address,
                    image: process.env.UPLOAD_URL + 'stadiums/' + fileNewName,
                    isActive: 1,
                    isDelete: 0,
                    createdBy: requestUserId,
                    updatedBy: requestUserId,
                };
                //Get latitude longitude from address
                geocoder.getLatLongFromAddress(postData.address).then(function (result) {
                    stadiumData.latitude = result.result.latitude;
                    stadiumData.longitude = result.result.longitude;
                    //save data to stadiums
                    models.stadiums.create(stadiumData).then(function (data) {
                        return res.json({
                            success: true,
                            message: appMessage.stadium.success.dataAdded,
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
                }, function (error) {
                    return res.status(400).send({
                        status: false,
                        error: error
                    });
                });
            }
        });
    },
    /**
     * @desc Update Stadium details with name, image, address
     * Get lat-logn from give address
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update: function (req, res) {
        var postData = req.body;        
        models.stadiums.findOne({
            where: {id: req.params.id}
        }).then(function (data) {
            if (data !== null) {
                //Set new property data
                data.name = postData.name;
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
                    image.mv(imageUploadPath + "stadiums/" + fileNewName, function (err) {
                        if(err) {
                            return res.status(400).json({
                                success: false,
                                result: "Something went wrong, Please try again."
                            });
                        } else {
                            data.image = process.env.UPLOAD_URL + 'stadiums/' + fileNewName;
                        }
                    });
                }
                //Get latitude longitude from address
                geocoder.getLatLongFromAddress(postData.address).then(function (result) {
                    data.address = postData.address;
                    data.latitude = result.result.latitude;
                    data.longitude = result.result.longitude;
                    //save data to stadiums
                    data.save().then(function (data) {
                        data.image = (data.image != '') ? data.image : ""
                        return res.json({
                            success: true,
                            message: appMessage.stadium.success.dataUpdated,
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
                });
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
     * @desc Delete stadium details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete: function (req, res) {
        var stadiumId = req.params.id;
        models.stadiums.destroy({where: {id: stadiumId}}).then(function (result) {
            return res.json({
                success: true,
                result: result,
                message: appMessage.stadium.success.dataDeleted,
            });
        }).catch(function (err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
}