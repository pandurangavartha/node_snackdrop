/**
 * @desc FAQs APIs controller
 */

module.exports = {
    /**
     * Get FAQs 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}\
     */
    getFaqs: function (req,res) {
        var timestamp = req.body.timestamp;
        //Set default where condition
        var wherecondtion = {
                isActive:true,
            };
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion =  {
                isActive:true,
                createdOn : {$lt : timestamp}
            };
        }
        
        models.faqs.findAll({
            attributes : ['id','question','answer','createdOn'],
            where : wherecondtion,
            order :"createdOn DESC",
            limit : 10,
        }).then(function(data) {
            
            models.settings.findOne({
                    attributes : ['values'],
                    where : {fields:'emailForQuery'}
            }).then(function(taxData){
                var taxDetails =  taxData.values;
                return res.json({
                    success: true,
                    emailForQuery : taxDetails,
                    result: data
                });
            }).catch(function(){
                return res.json({
                    success: true,
                    tax : "",
                    result: data
                });
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).json({
                        success: false,
                        error: err.errors
                    });
        }).catch(function (err){
            return res.status(400).send({
                success: false,
                error: err.message
            });
        });
    },
   
}