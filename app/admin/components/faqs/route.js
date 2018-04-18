/*
 * Routes for FAQs based actions 
 */
var faqs = require('./controller')

app.post('/faqs-list', faqs.getList);
app.post('/faqs', faqs.create);
app.get('/faqs/:id', faqs.viewDetails);
app.put('/faqs/:id', faqs.update);
app.delete('/faqs/:id', faqs.delete);
