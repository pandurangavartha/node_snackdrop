/*
 * Routes for post 
 */
var productApis = require('./controller');

v2router.get('/get-product-categories/:stadiumId', productApis.getProductCategoryList);
v2router.post('/get-products', productApis.getProductList);
v2router.post('/search-deal-product', productApis.searchProduct);
v2router.post('/get-status', productApis.getProductStatus);



