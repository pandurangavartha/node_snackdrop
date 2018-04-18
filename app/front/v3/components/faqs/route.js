/*
 * Routes for post 
 */
var faqsApis = require('./controller')

v3router.post('/get-faqs', faqsApis.getFaqs);
