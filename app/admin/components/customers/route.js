/*
 * Routes for customer actions 
 */
var customers = require('./controller')

app.post('/customers', customers.getList);
app.get('/customers/:id', customers.viewDetails);
