
/**
 * @desc Product Category Controller
 */
module.exports = {
    /**
     * @desc Get List of Product Catefgory
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) {
        var timestamp = req.body.timestamp; 
        //Set default where condition
        var wherecondtion = {isDelete : 0};
        var conditionStadium = {isActive:1,isDelete: 0};
         //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        if(typeof req.body.name != 'undefined' && req.body.name != '' && req.body.name != null) {
            wherecondtion.name = {$like : "%"+req.body.name+"%"};
        }
        if(typeof req.body.stadiumName != 'undefined' && req.body.stadiumName != '' && req.body.stadiumName != null) {
            conditionStadium.name = {$like : "%"+req.body.stadiumName+"%"};
        }
         if(typeof req.body.stadiumId != 'undefined' && req.body.stadiumId != '' && req.body.stadiumId != null) {
            wherecondtion.stadiumId = req.body.stadiumId
        }
        models.productcategory.findAll({
            attributes: ['id','name','isActive','isDelete','createdOn','updatedOn','stadiumId'],
            where : wherecondtion,
            order :"createdOn DESC",
            limit : 50,
            include : [{
                    where : conditionStadium,
                    attributes : ['id', 'name'],
                    model : models.stadiums
            }]
        }).then(function(data) {
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.category.error.dataNotFound,
                });
            }
        }).catch(function (err) {
            return res.status(400).send({
                status: false,
                error: err.message
            });
        });
    },    
    /**
     * @desc Get details of product category
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
        var catId = req.params.id;
        models.productcategory.findAll({
            attributes: ['id','name','isActive','isDelete','createdOn','updatedOn','stadiumId'],
            where : {id : catId},
            include : [
                {
                    attributes : ['id','name'],
                    model : models.stadiums
                },
            ],
//            required : false
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.category.error.dataNotFound,
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });
    },
    /**
     * @desc Create New Product Category
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    create : function (req, res) {
        var postData = req.body;
        var requiredParams = ['name','stadiumId'];
        helper.validateRequiredParams(req, res, requiredParams).then(function (response) {
            var categoryData = {
                name : postData.name,
                stadiumId : postData.stadiumId,
                isActive : 1,
                isDelete : 0,
                createdBy : requestUserId,
                updatedBy : requestUserId,
            };
            //add data
            models.productcategory.create(categoryData).then(function(data) {
                return res.json({
                    success: true,
                    message: appMessage.category.success.dataAdded,
                    result: data
                });
            }).catch(Sequelize.ValidationError, function (err) {
                return res.status(422).json({
                    status: false,
                    error: err.errors[0].message
                });
            }).catch(function (err) {
                return res.status(400).send({
                    status: false,
                    error: err.message
                });
            });
        });
    },
    /**
     * @desc Update Product Category
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    update : function (req, res) {
        var postData = req.body;
        models.productcategory.findOne({
            where : {id : req.params.id},
        }).then(function(productcategory) {            
            productcategory.name = postData.name;
            productcategory.updatedBy = requestUserId;
            productcategory.save().then(function(result) {
                return res.json({
                    success: true,
                    result : result,
                    message: appMessage.category.success.dataUpdated,
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
     * @desc Delete Product Category
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete : function (req, res) {
        var productCategoryId = req.params.id;
        var postData = req.body;
        models.productcategory.findOne({
            where: {
                id: productCategoryId
            },
        }).then(function(productcategory) {
            productcategory.isDelete = postData.isDelete;
            productcategory.id = postData.id;
            productcategory.save().then(function(result) {
                models.products.update({
                    isDelete: 1
                }, {
                    where: {
                        categoryId: productCategoryId
                    }
                }).then(function(data) {
                    return res.json({
                        success: true,
                        message: appMessage.category.success.dataDeleted,
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
    },
    /**
     * @desc Get List of Product Category based on stadium
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    categoryByStadium: function (req, res) {
        var stadiumId = req.params.stadiumId;
        models.productcategory.findAll({
            attributes: ['id','name','isActive','isDelete','createdOn','updatedOn'],
            where : {stadiumId : stadiumId, isActive:1,isDelete:0},
            order :"createdOn DESC",
            include : [
                {
                    attributes : ['name'],
                    model : models.stadiums
                },
            ],
            required : false
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.category.error.dataNotFound,
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });       
    },
}