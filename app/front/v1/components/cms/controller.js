/**
 * @desc CMS Pages APIs controller
 */
module.exports = {
    /**
     * @desc Get Terms and conditions
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    termsAndConditions: function (req,res) {
        models.cmspages.findById(1).then(function(data) {
            var resData = {title:data.title, content:data.content};
            res.status(200).json({
                status: true,
                result: resData
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
    /**
     * @desc Get Privacy Policy
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    privacyPolicy: function (req,res) {
        models.cmspages.findById(2).then(function(data) {
            var resData = {title:data.title, content:data.content};
            res.status(200).json({
                status: true,
                result: resData
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