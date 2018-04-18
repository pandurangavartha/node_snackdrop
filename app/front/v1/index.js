/**
 * Include all routes of components
 */
require('./components/users/route');
require('./components/cms/route');
require('./components/faqs/route');
require('./components/stadiums/route');
require('./components/products/route');
require('./components/deals/route');
/**
 * Set Prefix for routes
 */
app.use('/api/v1', router);