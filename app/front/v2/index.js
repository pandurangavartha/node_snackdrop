/**
 * Include all routes of components
 */
//create router for below component routes
global.v2router = express.Router();

require('./components/users/route');
require('./components/cms/route');
require('./components/faqs/route');
require('./components/stadiums/route');
require('./components/products/route');
require('./components/deals/route');
require('./components/orders/route');
require('./components/payment/route');
require('./components/guest/route');
/**
 * Set Prefix for routes
 */
app.use('/api/v2', v2router);