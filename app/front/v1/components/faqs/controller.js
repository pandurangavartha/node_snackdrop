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
        
        models.faqs.findAll({}).then(function(data) {
            //var resData = {title:data.title, content:data.content};
            res.status(200).json({
                status: true,
                result: data
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).json({
                        status: false,
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