/*
 * Routes for CMS actions 
 */
var cms = require('./controller')

app.get('/cms', cms.getList);
app.get('/cms/:id', cms.viewDetails);
app.put('/cms/:id', cms.update);
