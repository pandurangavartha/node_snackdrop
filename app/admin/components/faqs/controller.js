
/**
 * @desc FAQs Controller
 */
module.exports = {
    /**
     * @desc Get List of FAQs
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
        var timestamp = req.body.timestamp; 
        //Set default where condition
        var wherecondtion = {isDelete : 0};
         //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }        
        models.faqs.findAll({
            attributes: ['id','question','answer','isActive','isDelete','createdOn','updatedOn'],
            where : wherecondtion,
            order :"createdOn DESC",
            limit : 50,
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    message: appMessage.faqs.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc View details of faq by id
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        models.faqs.findOne({
            attributes: ['id','question','answer','isActive','isDelete','createdOn','updatedOn'],
            where : {id : req.params.id}
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success : false,
                    message: appMessage.faqs.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Create FAQ 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create : function (req, res) {
        var postData = req.body;
        var requiredParams = ['question', 'answer'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            //add faq data
            var faq = {
                question : postData.question,
                answer : postData.answer,
                createdBy : requestUserId,
                updatedBy : requestUserId,
                isActive : 1,
                isDelete : 0,
            };
            models.faqs.create(faq).then(function(data){
                return res.json({
                    success: true,
                    message: appMessage.faqs.success.dataAdded,
                    result: data
                });
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).json({
                    status: false,
                    error: err.errors[0].message
                });
            }).catch(function (err) {
                res.status(400).json({
                    status: false,
                    error: err.message
                });
            });
        });
    },
    /**
     * @desc Update FAQ
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        
        var faqId = req.params.id;
        var postData = req.body;
        models.faqs.findOne({
            where : {id : faqId},
        }).then(function(faq) {
            
            faq.question = postData.question;
            faq.answer = postData.answer;
            faq.updatedBy = requestUserId;
            faq.save().then(function(result) {
                return res.json({
                    success: true,
                    message: appMessage.faqs.success.dataUpdated,
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
     * @desc Delete faq : set isDelete 1
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {
        var faqId = req.params.id;
        models.faqs.destroy({
            where : {id : faqId},
        }).then(function(faq) {
            return res.json({
                success: true,
                message: appMessage.faqs.success.dataDeleted,
            });
        }).catch(function(err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
}