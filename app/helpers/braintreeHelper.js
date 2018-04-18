/**
 * @desc Braintree Helper for Payment with paypal and credit/debit card
 * @type Module braintree|Module braintree
 * @auther Darshna Joshi <217>
 * @date 23-11-2017
 */
var braintree = require("braintree");
var Q = require('q');

var braintreeHelper = {};
/**
 * Set up gateway
 */
braintreeHelper.gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

/**
 * @desc create transation by nonce created by client side
 * @param {String} nonceFromTheClient : nonce token by client side
 * @param {String} amount: payment amount
 * @returns Result with success or fail
 * @auther Darshna Joshi <217>
 * @date 23-11-2017
 */
braintreeHelper.transationByNonce = function (nonceFromTheClient, amount) {

    var deferred = Q.defer();
    //transaction
    braintreeHelper.gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    }, function (error, result) {
        if (error) {
            deferred.reject({success: false,error:result.message});
        } else if(result.success == false) {
            deferred.reject({success: false,error:result.message});
        } else {
            deferred.resolve({success: true,message:"Payment success"});
        }
    });
    //return result
    return deferred.promise;
}
/**
 * @desc create transation by nonce created by client side with 3d secure
 * @param {String} nonceFromTheClient : nonce token by client side
 * @param {String} amount: payment amount
 * @returns Result with success or fail
 * @auther Darshna Joshi <217>
 * @date 23-11-2017
 */
braintreeHelper.secureTransationByNonce = function (nonceFromTheClient, amount) {

    var deferred = Q.defer();
    //transaction
    braintreeHelper.gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            threeDSecure: {
                required: true
            },
        }
    }, function (error, result) {
        if (error) {
            deferred.reject(error);
        } else if(result.false) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    });
    //return result
    return deferred.promise;
}
/**
 * @desc generate nonce for transaction
 * @returns {.Q@call;defer.promise}
 */
braintreeHelper.generatePaymentNonce = function () {
    
    var deferred = Q.defer();
    braintreeHelper.gateway.clientToken.generate({}, function (error, response) {
        if (error) {
            deferred.reject({status: false,'error':error});
        } else {
            deferred.resolve({status: true, 'result':response.clientToken});
        }
    });
    return deferred.promise;
}

module.exports = braintreeHelper;