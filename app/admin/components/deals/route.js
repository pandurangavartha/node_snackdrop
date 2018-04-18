/*
 * Routes for Deals based actions 
 */
var deals = require('./controller')

app.post('/deals-list', deals.getList);
app.post('/deals', deals.create);
app.get('/deals/:id', deals.viewDetails);
app.put('/deals/:id', deals.update);
app.delete('/deals/:id', deals.delete);
app.put('/updateDealStatus/:id', deals.updateDealStatus);

