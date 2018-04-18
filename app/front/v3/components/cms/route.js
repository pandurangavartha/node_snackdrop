/*
 * Routes for CMS Pages API routes
 */
var cmsApis = require('./controller')

v3router.get('/terms-and-conditions', cmsApis.termsAndConditions);
v3router.get('/privacy-policy', cmsApis.privacyPolicy);
