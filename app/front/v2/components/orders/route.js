/*
 * Routes for post 
 */
var orderApis = require('./controller');

v2router.post('/place-order', orderApis.placeOrder);
v2router.get('/orders', orderApis.orderDetails);
v2router.post('/orders-list', orderApis.orderList);
