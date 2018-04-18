/*
 * Routes for post 
 */
var productApis = require('./controller');

v3router.get('/get-product-categories/:stadiumId', productApis.getProductCategoryList);
v3router.post('/get-products', productApis.getProductList);
v3router.post('/search-deal-product', productApis.searchProduct);
v3router.post('/get-status', productApis.getProductStatus);

