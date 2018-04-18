/*
 * Routes for post 
 */
var faqsApis = require('./controller')

v2router.post('/get-faqs', faqsApis.getFaqs);
