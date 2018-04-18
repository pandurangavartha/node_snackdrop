/**
 * This is the config class.
 * It contains all the methods of config
 * @class configWebController
 */

var defaultMasterData = require('../../../helpers/default.schema');
var asyncLoop = require('node-async-loop');
var bcrypt = require("bcrypt-nodejs");
var randomstring = require("randomstring");

module.exports = {

    /**
     * @desc Resize image using image magic helper
     * @param string srcPath image url -this url must be in encodeURIComponent format : in Path 
     * @param integer width : in Path
     * @returns Image
     */
    resizeImage: function (req, res) {

        //default width
        var width = 350;
        //get pic url from url
        if (typeof req.query.pic != "undefined") {
            var srcPath = req.query.pic;
        }
        //get width from url
        if (typeof req.query.width != "undefined") {
            var width = req.query.width;
        }
        //Call resizeImage function from imageMagicHelper
        imageMagicHelper.resizeImage(srcPath, width, res);
    },
    /**
     * @desc Crop Image using by image magic helper
     * @param string srcPath : in Path
     * @param integer width : in Path
     * @param integer height : in Path
     * @param string gravity : in Path - Cropping gravity :for center cropping use :Center
     * @returns image
     */
    cropImage: function (req, res) {

        //default setting
        var width = 350;
        var height = 350;
        /**
         * Gravity
         * "Center", "East", "North", "West", "South"
         */
        var gravity = "North";
        //get pic url from url
        if (typeof req.query.pic != "undefined") {
            var srcPath = req.query.pic;
        }
        //get width from url
        if (typeof req.query.width != "undefined") {
            var width = req.query.width;
        }
        //get height from url
        if (typeof req.query.height != "undefined") {
            var height = req.query.height;
        }
        //get gravity from url
        if (typeof req.query.gravity != "undefined") {
            var gravity = req.query.gravity;
        }
        imageMagicHelper.cropImage(srcPath, width, height, gravity, res);
    }
};
