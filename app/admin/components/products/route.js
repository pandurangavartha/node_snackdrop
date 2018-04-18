/*
 * Routes for Products based actions 
 */
console.log("===========================")
var products = require('./controller')

app.post('/products-list', products.getList);
app.post('/products', products.create);
app.get('/products/:id', products.viewDetails);
app.put('/products/:id', products.update);
app.delete('/products/:id', products.delete);
app.get('/getProducts/:id', products.getProducts);
app.put('/updateStatus', products.updateStatus);
