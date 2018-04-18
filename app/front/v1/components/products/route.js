/*
 * Routes for post 
 */
var productApis = require('./controller');

router.get('/get-product-categories/:stadiumId', productApis.getProductCategoryList);
router.post('/get-products', productApis.getProductList);
