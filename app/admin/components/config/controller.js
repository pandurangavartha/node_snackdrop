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
    * Action for inserting default master data
    *
    * @method insterDefaultMasterData
    * @param {req} request
    * @param {res} response
    * @return {status} res -If it returns error then the status is false otherwise true. 
    */
   
    insterDefaultMasterData: function (req, res) {
        var masterCountor = 0;
        var modelName = req.params.modelName;
        if (typeof modelName != 'undefined' && modelName != '') {
            _sequelize.bulkSave(modelName, defaultMasterData[modelName]).then(function () {
                res.json({
                    success: true
                });
            }).catch(function (error) {
                winston.log('error');
                helper.formatResponse('', res, error.error);
            });
        } else {
            _.each(defaultMasterData, function (elm, ind) {
                _sequelize.bulkSave(ind, elm).then(function () {

                    masterCountor++;
                    if (_.size(defaultMasterData) == masterCountor) {
                        res.json({
                            success: true
                        });
                    }
                }).catch(function (error) {
                    helper.formatResponse('', res, error.error);
                });
            });
        }
    },
    /**
     * @desc Create SQL View for Combine Deals and Products
     * @param {type} req
     * @param {type} res
     * @return {undefined}
     */
    createViewForDealAndProducts : function(req, res) {
        //query for deals data
        var dealQuery = "SELECT deals.id,deals.name,deals.price,deals.quantity,deals.createdOn,deals.image,\n\
            deals.shortDesc,deals.longDesc,deals.stadiumId,1 AS isDeal, '' AS categoryName,\n\
            (SELECT vendorconfigs.values FROM vendorconfigs WHERE vendorDetailsId = vendordetails.id AND keyName ='minDelTime') AS minDelTime\n\
            FROM deals\n\
            LEFT JOIN dealsproducts ON deals.id = dealsproducts.dealId \n\
            LEFT JOIN products ON dealsproducts.productId = products.id \n\
            LEFT JOIN vendordetails ON products.vendorDetailsId = vendordetails.id \n\
            WHERE deals.isActive = 1 GROUP BY deals.id";
        //Query for product data
        var productQuery = "SELECT products.id,products.name,products.price,products.quantity,products.createdOn,\n\
            products.image,products.shortDesc,products.longDesc,vendordetails.stadiumId AS stadiumId,\n\
            0 AS isDeal,productcategories.name AS categoryName, \n\
            (SELECT vendorconfigs.values FROM vendorconfigs WHERE vendorDetailsId = vendordetails.id AND keyName ='minDelTime') AS minDelTime\n\
            FROM products \n\
            LEFT JOIN productcategories ON products.categoryId = productcategories.id \n\
            LEFT JOIN vendordetails ON products.vendorDetailsId = vendordetails.id \n\
            WHERE products.isActive = 1";
        
        //create view query with both data deals & products
        var viewQuery = "CREATE VIEW dealandproducts AS ("+dealQuery+") UNION ("+productQuery+")";
        
        sequelize.query(viewQuery).then(function(data) {
            res.send(data);
        }).catch(function(err) {
            res.status(404).send(err);
        });
        
    }
};
