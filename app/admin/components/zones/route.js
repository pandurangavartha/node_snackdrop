/*
 * Routes for zones actions 
 */
var vendors = require('./controller')

app.post('/zones-list/:stadiumId', vendors.getList);
app.get('/parent-zones-list/:stadiumId', vendors.getParentZoneList);
app.post('/zones', vendors.create);
app.get('/zones/:id', vendors.viewDetails);
app.put('/zones/:id', vendors.update);
app.delete('/zones/:id', vendors.delete);
