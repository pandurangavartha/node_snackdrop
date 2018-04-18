/*
 * Routes for stadium actions 
 */
var vendors = require('./controller')

app.post('/stadiums-list', vendors.getList);
app.post('/stadiums', vendors.create);
app.get('/stadiums/:id', vendors.viewDetails);
app.put('/stadiums/:id', vendors.update);
app.delete('/stadiums/:id', vendors.delete);
