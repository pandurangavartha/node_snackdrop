/**
 * @desc Braintree Helper for Payment with paypal and credit/debit card
 * @type Module node-geocoder|Module node-geocoder
 * @auther Darshna Joshi <217>
 * @date 23-11-2017
 */
var NodeGeocoder = require('node-geocoder');
var Q = require('q');

var _geocoder = {};
/**
 * Set up options
 */
_geocoder.options = {
    provider: 'google',
    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GOOGLE_MAP_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

/**
 * @desc Get Latitude Longitude from given address
 * @param {type} address
 * @returns Result with success or fail
 * @auther Darshna Joshi <217>
 * @date 23-11-2017
 */
_geocoder.getLatLongFromAddress = function (address) {
    var deferred = Q.defer();
    var geocoder = NodeGeocoder(_geocoder.options);
    //call geocoder for get lat long from give add
    geocoder.geocode(address).then(function(result) {
        var lat = result[0].latitude;
        var long = result[0].longitude;
        var latLong = {'latitude':lat, 'longitude':long};
        deferred.resolve({status: true,'result':latLong});
    }).catch(function(error) {
        deferred.reject(error);
    });    
    //return result
    return deferred.promise;
}

module.exports = _geocoder;