var AWS = require('aws-sdk');

/*************************Config******************************/

var awsConfig = {
    accessKeyId: process.env.aws_access_key,
    secretAccessKey: process.env.aws_secret_key,
    region: process.env.aws_region_key
};

AWS.config.update(awsConfig);
var s3 = new AWS.S3();

/*************************End********************************/

module.exports = {
    /*
     * @param {type} options
     * @returns {}
     * @desc get sign url for uploading the file on s3
     */
    getPutObjectSignUrl: function (options) {
        return new Promise(function (resolve, reject) {
            s3.getSignedUrl('putObject', options, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve({signedRequest: data, url: 'https://s3.amazonaws.com/' + options.Bucket + '/' + options.Key});
            });
        });
    },
    /*
     * @param {type} options
     * @returns {}
     * @desc checking file is there or not
     */
    isFileExist: function (options) {
        return new Promise(function (resolve, reject) {
            s3.headObject(options, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    },
    /*
     * @param {type} options
     * @returns {}
     * @desc create folder in s3
     */
    createS3Folder: function (options) {

        return new Promise(function (resolve, reject) {
            s3.upload(options, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

    },
    /*
     * @param {type} options
     * @returns {}
     * @desc Delete single object in s3
     */
    deleteS3Object: function (options, cb) {
        return new Promise(function (resolve, reject) {
            s3.deleteObject(options, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    },
    /*
     * 
     * @param {type} options
     * @returns {}
     * @desc List all S3 objects
     */
    listS3Object: function (options, cb) {
        return new Promise(function (resolve, reject) {
            s3.listObjects(options, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

    },
    /*
     * @param {type} options
     * @returns {}
     * @desc Delete multiple s3 objects
     */
    deleteS3Objects: function (options) {
        return new Promise(function (resolve, reject) {
            s3.deleteObjects(options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },
    
    /*
     * @param {type} options
     * @returns {}
     * @desc Copy s3 objects
     */
    copyS3Object: function (options) {
        return new Promise(function (resolve, reject) {
            s3.copyObject(options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    
};
