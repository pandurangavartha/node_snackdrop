/**
 * @desc Stadium APIs controller
 */
module.exports = {
    /**
     * @desc Get Stadium List based on devcie locations(latitude, longitude)
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getStadiumListByLatLong: function (req, res) {
        var requiredParams = ['latitude', 'longitude'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {

            var latitude = req.body.latitude;
            var longitude = req.body.longitude;
            //fetch stadium within 10 km to given lat long
            models.stadiums.findAll({
                attributes: ['id', 'name', 'address', 'latitude', 'longitude',
                    ["111.111 *DEGREES(ACOS(COS(RADIANS(" + latitude + "))\n\
                    * COS(RADIANS(latitude))\n\
                    * COS(RADIANS(" + longitude + " - longitude))\n\
                    + SIN(RADIANS(" + latitude + "))\n\
                    * SIN(RADIANS(latitude))))", "dist"]
                ],
                where: {
                    isActive: 1,
                    isDelete: 0,
                },
//                having: [
//                    "dist <= 10"
//                ],
                order: "dist DESC",
                include: [{
                        attributes: ['id', 'zoneName'],
                        model: models.zones,
                        where: {isActive: 1, parentZoneId: null},
                        include: [{model: models.zones, as: 'subzones', attributes: ['id', 'zoneName'], required: false}],
                        required: false
                    }]
            }).then(function (data) {
                if (data.length !== 0) {
                    return res.json({
                        success: true,
                        result: data
                    });
                } else {
                    return res.status(404).send({
                        success: false,
                        message: appMessage.stadium.error.dataNotFound
                    });
                }
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        });
    },
    /**
     * @desc Get Stadium List based on name
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getStadiumListByName: function (req, res) {
        var requiredParams = ['name'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var name = req.body.name;
            //fetch stadium with name char
            models.stadiums.findAll({
                attributes: ['id', 'name', 'address', 'latitude', 'longitude'],
                where: {
                    name: {$like: '%' + name + '%'},
                    isActive: 1,
                    isDelete: 0,
                },
                include: [{
                        attributes: ['id', 'zoneName'],
                        model: models.zones,
                        where: {isActive: 1, parentZoneId: null},
                        include: [{model: models.zones, as: 'subzones', attributes: ['id', 'zoneName'], required: false}],
                        required: false
                    }],
            }).then(function (data) {
                if (data !== null) {
                    return res.json({
                        success: true,
                        result: data
                    });
                } else {
                    return res.status(404).send({
                        success: false,
                        error: appMessage.stadium.error.dataNotFound
                    });
                }
            }).catch(function (error) {
                helper.formatResponse('', res, error);
            });
        });
    },
}