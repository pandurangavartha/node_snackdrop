var masters = require('./controller')

/*
 * routes for Master Data Crud API
 */
app.post('/add', masters.save);
app.post('/get/:id', masters.findOne);
app.get('/get/:modelName', masters.find);
app.put('/get/:id', masters.update);
app.get('/change-status/:modelName/:status/:id', masters.changeStatus);
app.get('/delete/:modelName/:id', masters.delete);
//app.delete('/user/:id', masters.deleteUsers);
