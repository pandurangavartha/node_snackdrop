/**
 * @desc Product Deals APIs controller
 */
module.exports = {
    /**
     * @desc Get Product Deals based on stadiumId
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getDealsList: function (req, res) {
        var stadiumId = req.body.stadiumId;
        var timestamp = req.body.timestamp;
        //Image magic for resize image
        var width = 300;
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        
        //Set default where condition
        var wherecondtion = {
                stadiumId: stadiumId,
                isActive:true,
            };
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion =  {
                stadiumId: stadiumId,
                isActive:true,
                createdOn : {$lt : timestamp}
            };
        }
        //Fetch deals wth products details based on stadiumId
        models.deals.findAll({
            attributes: ['id','name','price','quantity','createdOn','image','shortDesc','longDesc'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 10,
            include : [{
                model : models.products,
                attributes: ['id','name','image','shortDesc','longDesc','price','quantity'],
                include: [{
                    attributes: ['name'],
                    model: models.productcategory,
                    required: false
                }]
            }],
        }).then(function(data) {
            if(typeof data != 'undefined' && data != '' && data != null) {
                //Image resize function call
                for(var i = 0; i < data.length;i++){
                    data[i].image = (data[i].image != "") ? resizeFunUrl+encodeURIComponent(data[i].image) : "";
                }
                return res.json({
                    success: true,
                    result: data
                });
            } else {
                return res.status(404).send({
                    success: false,
                    error: appMessage.product.error.dealsDataNotFound
                });
            }
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },
}