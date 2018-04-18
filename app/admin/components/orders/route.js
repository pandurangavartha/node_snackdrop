/*
 * Routes for orders based actions 
 */
var orders = require('./controller')

app.post('/orders-list', orders.getList);
app.post('/orders-status', orders.changeOrderStatus);
app.post('/transaction', orders.getTransactionDetails);
app.post('/orderHistory', orders.getOrderHistory);
app.delete('/deleteHistory', orders.deleteHistory);








