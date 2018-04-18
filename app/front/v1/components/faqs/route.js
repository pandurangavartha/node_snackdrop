/*
 * Routes for post 
 */
var faqsApis = require('./controller')

router.get('/get-faqs', faqsApis.getFaqs);
