/*
 * Routes for post 
 */
var dealsApis = require('./controller');

router.post('/get-deals', dealsApis.getDealsList);
