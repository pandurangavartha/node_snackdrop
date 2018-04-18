/*
 * Routes for FAQs based actions 
 */
var settings = require('./controller')


app.put('/vendorConfig/:id', settings.update);
app.get('/vendorDetails/:id', settings.viewDetails);
app.get('/settings-list', settings.getList);
app.put('/settings/:id', settings.updateSettings);


