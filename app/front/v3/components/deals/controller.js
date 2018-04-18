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
        if(typeof req.body.width != 'undefined' && req.body.width != '' && req.body.width != null) {
            width = req.body.width;
        }        
        var resizeFunUrl = process.env.IMAGE_RESIZE_ACTION_PATH+"?width="+width+"&pic=";
        
        //Set default where condition
        var wherecondtion = {
                stadiumId: stadiumId,
                isActive:true,
                isDelete:false,
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
                },{
                    attributes: ['id','businessName'],
                    model: models.vendordetails,
                    required: false,
                    include: [{
                        attributes: ['keyName', 'values'],
                        model: models.vendorconfig,
                        required: false
                    }]
                }]
            }],
        }).then(function(data) {
            if(typeof data != 'undefined' && data != '' && data != null) {
                var resData = [];
                //Image resize function call
                for(var i = 0; i < data.length;i++) {
                    
                    var configObj = data[i].products[0].vendordetail.vendorconfigs.find(o => o.keyName === 'minDelTime');
                    var deal = {
                        "id": data[i].id,
                        "name": data[i].name,
                        "price": data[i].price,
                        "quantity": data[i].quantity,
                        "createdOn": data[i].createdOn,
                        "image": (data[i].image != "") ? resizeFunUrl+encodeURIComponent(data[i].image) : "",
                        "shortDesc": data[i].shortDesc,
                        "longDesc": data[i].longDesc,
                        "minDelTime" :configObj.values,
                        isDeal : 1
//                        "products": data[i].products,                        
                    };
                    resData[i] = deal;
                }
                return res.json({
                    success: true,
                    result: resData
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