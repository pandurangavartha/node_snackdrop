
/**
 * @desc CMS Controller
 */
module.exports = {
    /**
     * @desc Get List of CMS Pages
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
        models.cmspages.findAll({
           attributes: ['id','title','content','isActive','isDelete','createdOn','updatedOn'], 
        }).then(function(data) {
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.cms.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc View Details of CMS Page
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        models.cmspages.findOne({
           attributes: ['id','title','content','isActive','isDelete','createdOn','updatedOn'],
           where : {id : req.params.id}
        }).then(function(data) {
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.cms.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Update CMS Page content
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        var postData = req.body;
        models.cmspages.findOne({
           attributes: ['id','title','content','isActive','isDelete','createdOn','updatedOn'],
           where : {id : req.params.id}
        }).then(function(data) {
            if(data !== null) {                
                data.content = postData.content;
                data.updatedBy = requestUserId;
                data.save().then(function(updatedData) {
                    return res.json({
                        success: true,
                        message: appMessage.cms.success.dataUpdated,
                        result: updatedData
                    });
                }).catch(function(error){
                    helper.formatResponse('', res, error);
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.cms.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
}