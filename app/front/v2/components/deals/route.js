/*
 * Routes for post 
 */
var dealsApis = require('./controller');

v2router.post('/get-deals', dealsApis.getDealsList);
