/*
 * Routes for post 
 * Payment APIs
 * Verify-Token
 */
var paymentApis = require('./controller');

v2router.post('/transaction-by-token', paymentApis.transactionByToken);
v2router.get('/generate-token', paymentApis.generateNonceForTransaction);
