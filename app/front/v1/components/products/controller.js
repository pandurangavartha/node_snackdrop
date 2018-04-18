/**
 * @desc Product Category & Products APIs controller
 */
module.exports = {
    /**
     * @desc Get Product category list based on stadiumId
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProductCategoryList: function (req,res) {
        var stadiumId = req.params.stadiumId;        
        models.productcategory.findAll({
            attributes: ['id','name'],
            where: {
                stadiumId: stadiumId, isActive:true
            },
            order :"name ASC",
        }).then(function(data) {            
            if(typeof data != 'undefined' && data != '' && data != null) {
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.product.error.categoryDataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        })
    },
    /**
     * @desc Get Product List based on categoryId
     * Pagination depends on createdOn timestamp
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getProductList : function(req,res) {
        var categoryId = req.body.categoryId;        
        var timestamp = req.body.timestamp;
        //Image magic for resize image
        var width = 300;
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        //Set default where condition
        var wherecondtion = {
                categoryId: categoryId,
                isActive:true,
            };
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion =  {
                categoryId: categoryId,
                isActive:true,
                createdOn : {$lt : timestamp}
            };
        }
        //Fetch products based on categoryId
        models.products.findAll({
            attributes: ['id','name','image','shortDesc','longDesc','price','quantity','createdOn'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 10,
            include: [{
                attributes: ['id', 'name'],
                model: models.productcategory,
                required: false
            }]
        }).then(function(data) {
            if(typeof data != 'undefined' && data != '' && data != null) {
                //Image resize function call
                for(var i = 0; i < data.length;i++) {
                    data[i].image = (data[i].image != "") ? resizeFunUrl+encodeURIComponent(data[i].image) : "";
                }
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.product.error.dataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
   
}