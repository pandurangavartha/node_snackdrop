
/**
 * @desc settings Controller
 */
module.exports = {
    /**
     * @desc Update SETTINGS
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
       update : function (req, res) {
        var postData = req.body;
        models.vendorconfig.findOne({
           attributes: ['id','keyName','values','updatedOn','vendorDetailsId'],
           where : {id : req.params.id}
        }).then(function(data) {
            if(data !== null) {                
                data.keyName = postData.keyName;
                data.values = postData.values;
                data.vendorDetailsId = postData.vendorDetailsId;
                data.save().then(function(updatedData) {
                    return res.json({
                        success: true,
                        message: appMessage.vendorconfig.success.dataUpdated,
                        result: updatedData
                    });
                }).catch(function(error){
                    helper.formatResponse('', res, error);
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.vendorconfig.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },

  /**
     * @desc View details of vendors by id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        models.vendordetails.findOne({
            attributes: ['id','businessName','createdOn','updatedOn'],
            where : {id : req.params.id},
            include: [{
                attributes: ['id','keyName','values'],
                model: models.vendorconfig,
            }],
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success : false,
                    message: appMessage.vendorconfig.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },

     /**
     * @desc Get List of Settings
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList : function (req, res) {
        //Get list of Settings
          models.settings.findAll({
            attributes: ['id','fields','values','updatedOn','updatedBy'],
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.settings.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
      /**
     * @desc Update Settings Page content
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    updateSettings : function (req, res) {
        var postData = req.body;
        models.settings.findOne({
           attributes: ['id','fields','values','updatedOn','updatedBy'],
           where : {id : req.params.id}
        }).then(function(data) {
            if(data !== null) {                
                data.fields = postData.fields;
                data.values = postData.values;
                data.updatedBy = requestUserId;
                data.save().then(function(updatedData) {
                    return res.json({
                        success: true,
                        message: appMessage.settings.success.dataUpdated,
                        result: updatedData
                    });
                }).catch(function(error){
                    helper.formatResponse('', res, error);
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.settings.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },

}
