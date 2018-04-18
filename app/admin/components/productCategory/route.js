/*
 * Routes for Product Category based actions 
 */
var productCate = require('./controller')

app.post('/product-categories-list', productCate.getList);
app.post('/product-categories', productCate.create);
app.get('/product-categories/:id', productCate.viewDetails);
app.put('/product-categories/:id', productCate.update);
app.delete('/product-categories/:id', productCate.delete);
app.get('/product-categories-by-satadium/:stadiumId', productCate.categoryByStadium);
