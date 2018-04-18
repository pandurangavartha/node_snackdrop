/*
 * dotenv setup to manage environments
 */
var argv = require('yargs')
        .command('environment', function (yargs) {
            yargs.options({
                location: {
                    demand: true,
                    alias: 'e',
                    type: 'string'
                }
            });
        })
        .help('help')
        .argv;
envFileName = argv.e;
require('dotenv').config({path: ".env." + envFileName});

/*
 * define all global and local variables
 */
global.express = require('express');
global.path = require('path');
global.fs = require('fs');
global.app = express();
app.use('/public', express.static(path.join(__dirname, 'public')));
global.bodyParser = require('body-parser');
//Multiparty for image upload & path for image uploads dir
global.fileUpload = require('express-fileupload');
global.uuid = require('uuid');
//global.multiparty = require('multiparty');
global.imageUploadPath = process.env.UPLOAD_PATH;

global.cors = require('cors');
global.logger = require('morgan');
global.router = express.Router();

global.async = require('async');

global.helper = require('./app/helpers/_helpers');
global._sequelize = require('./app/helpers/_sequelize');
//email hepler with option smtp gmail | ses
global.mailHelper = require('./app/helpers/mailHelper');
//Image magic helper for image resize
global.imageMagicHelper = require('./app/helpers/imageMagicHelper');
global.destinationPath = process.env.IMAGE_DEST_PATH;
//Braintree transaction Helper
global.braintreeHelper = require('./app/helpers/braintreeHelper');
//geocoder helper
global.geocoder = require('./app/helpers/_geocoder');
global.notification = require('./app/helpers/_notification');


global.appMessage = require('./app/helpers/language/' + process.env.MSGLANG + ".msg.js");

global.Sequelize = require('sequelize');
global.Op = Sequelize.Op;
app.use(bodyParser.urlencoded({extended: false,limit: '50mb',parameterLimit: 1000000}));
app.use(bodyParser.json());
var ip = require("ip");
global.requestUserIp = ip.address();

/*
 * for angular
 */
app.use(cors());
app.options('*',cors({origin: '*'}));
/*DISPLAY LOG*/
app.use(logger('dev'));
app.use(fileUpload());
/**
 * For validation using middleware
 */
app.use(function (req, res, next) { 
    res.header("Access-Control-Expose-Headers", "x-access-token");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

global.auth = require('./app/middleware/auth.js');
app.use(auth('on'));

var colors = require('colors');
var settings = require('./config/settings');
global._ = require('lodash');

global.dateTime = require('node-datetime');

global.models = require('./app/models');

global.admin = require('./app/admin/');
require('./app/front/');

var http = require('http').Server(app);

models.sequelize.sync().then(function () {
    http.listen(settings.port, function () {
         console.log("Listening on port " + settings.port);
    }).on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            console.log('Address in use. Is the server already running?');
        }
    });
});