/*
 * Routes for CMS Pages API routes
 */
var cmsApis = require('./controller')

v2router.get('/terms-and-conditions', cmsApis.termsAndConditions);
v2router.get('/privacy-policy', cmsApis.privacyPolicy);
