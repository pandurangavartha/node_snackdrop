/**
 * @desc Push notification module for sending push notification to android or ios
 * @type Module node-pushnotifications|Module node-pushnotifications
 * @type Module q|Module q promise module
 * @author Darshna Joshi<217>
 * @date 05 DEC 2017
 */

var PushNotifications = require('node-pushnotifications');
var Q = require('q');

var _notification = {};
/**
 * Setting Obj for GCM and APN
 */

_notification.settings = {
    gcm: {
        id: process.env.ANDROID_GCM_KEY,
    },
    apn: {
       
        cert :process.env.APN_CERTI_PATH,
        key : process.env.APN_CERTI_PATH,
        passphrase : process.env.APN_PASSPHRASE,
        topic : process.env.IOS_TOPIC,
        production : (process.env.APN_ENV == "production") ? true : false,

    },
};

_notification.sendNotification = function (registrationIds, msgdata, alert) {
    //object for push
    const push = new PushNotifications(_notification.settings);
    var deferred = Q.defer();
    var data = {
        body: alert,
        topic : process.env.IOS_TOPIC,
        priority: 'high',        
        badge: 0,
        sound: 'ping.aiff', 
        alert: alert,   
       titleLocArgs:msgdata,
       custom : msgdata
    }; 
    
    push.send(registrationIds, data, function(err, result) {
        if (err) {
          deferred.reject({status: false, 'error': err});
        } else {
            deferred.resolve({status: true, 'result': result});
        }
    });
     return deferred.promise;
}

module.exports = _notification;