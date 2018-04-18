var config = require('./controller')

/*
 * routes for Configuration Controller
 */

app.get('/config/setup', config.insterDefaultMasterData);
app.get('/config/setup/:modelName', config.insterDefaultMasterData);
app.get('/config/viewCreate', config.createViewForDealAndProducts);
