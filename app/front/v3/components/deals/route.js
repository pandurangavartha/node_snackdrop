/*
 * Routes for post 
 */
var dealsApis = require('./controller');

v3router.post('/get-deals', dealsApis.getDealsList);
