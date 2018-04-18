/*
 * Routes for post 
 */
var orderApis = require('./controller');

v3router.post('/place-order', orderApis.placeOrder);
v3router.get('/orders/:id', orderApis.orderDetails);
v3router.post('/orders-list', orderApis.orderList);
