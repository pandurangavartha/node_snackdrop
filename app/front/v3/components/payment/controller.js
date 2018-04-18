/**
 * @desc Payment APIs controller
 */

module.exports = {
    /**
     * @desc Token (Nonce) Verification Paypal payment method
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    transactionByToken : function (req,res) {
        var amount = req.body.amount;
        var token = req.body.token;
        
        braintreeHelper.transationByNonce(token,amount).then(function(response) {
            if(response.success) {
                return res.json({
                    success: true,
                    message: response.message
                });
            } else {
                return res.status(422).json({
                    success: false,
                    error: response.error
                });
            }
        },function(error){
            return res.status(400).json({
                success: false,
                error: error.error
            });
        });
    },
    /**
     * @desc generate nonce for transaction
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    generateNonceForTransaction: function (req,res) {        
        braintreeHelper.generatePaymentNonce().then(function(response) {        
            res.send(response);
        },function(error){
            res.send(error);
        });  
    },
    
}