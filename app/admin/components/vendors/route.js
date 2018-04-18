/*
 * Routes for Vendor actions 
 */
var vendors = require('./controller')

app.post('/vendors', vendors.create);
app.get('/vendors/link-verification/:code', vendors.activationLinkVerify);
app.post('/vendors/account-activation', vendors.accountActivate);
app.post('/vendors-list', vendors.getList);
app.get('/vendors/:id', vendors.viewDetails);
app.put('/vendors/:id', vendors.update);
app.delete('/vendors/:id', vendors.delete);
app.get('/totalOrder/:vendorDetailsId', vendors.totalOrder);
