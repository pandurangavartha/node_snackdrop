/*
 * Routes for post 
 * Payment APIs
 * Verify-Token
 */
var paymentApis = require('./controller');

v3router.post('/transaction-by-token', paymentApis.transactionByToken);
v3router.get('/generate-token', paymentApis.generateNonceForTransaction);
