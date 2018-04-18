/**
 * @descImage Magic Helper for resize image with url of image and width & Crop Image with url, width, height 
 * @type Module imagemagick|Module imagemagick
 * @author Darshna Joshi<217>
 */
var im = require('imagemagick');
var md5 = require('md5');

var imageMagicHelper = {};
/**
 * @desc Resize image with given width to URL of image  
 * @param String srcPath URL of Image
 * @param Integer width
 * @param Object res
 * @returns Image
 */
imageMagicHelper.resizeImage = function (encodedSrcPath, width, res) {
    
    var srcPath = decodeURIComponent(encodedSrcPath);
    var imageName = md5(srcPath + width);
    var ext = path.extname(srcPath);
    var fileName = imageName + ext;
    //set this in app.js
    var destPath = destinationPath + fileName;
    
    if (fs.existsSync(destPath)) {
        var img = fs.readFileSync(destPath);
        res.end(img, 'binary');
    } else {
        im.resize({
            srcPath: srcPath,
            dstPath: destPath,
            width: width,
            strip: false,
        }, function (err, stdout, stderr) {
            if (err) {
                res.send(err);
            } else {
                var img = fs.readFileSync(destPath);
                res.end(img, 'binary');
            }
        });
    }
}
/**
 * @desc Crop image with given width & height
 * @param String srcPath URL of Image
 * @param Integer width
 * @param Integer height
 * @param Object res
 * @returns Image
 */
imageMagicHelper.cropImage = function (encodedSrcPath, width, height, gravity, res) {

    var srcPath = decodeURIComponent(encodedSrcPath);
    var imageName = md5(srcPath + width + height + gravity);
    var ext = path.extname(srcPath);
    var fileName = imageName + ext;
    var destPath = destinationPath + fileName;

    if (fs.existsSync(destPath)) {
        var img = fs.readFileSync(destPath);
        res.end(img, 'binary');
    } else {
        im.crop({
            srcPath: srcPath,
            dstPath: destPath,
            width: width,
            height: height,
            quality: 1,
            gravity: gravity
        }, function (err, stdout, stderr) {
            if (err) {
                res.send(err);
            } else {
                var img = fs.readFileSync(destPath);
                res.end(img, 'binary');
            }
        });
    }
}

module.exports = imageMagicHelper;