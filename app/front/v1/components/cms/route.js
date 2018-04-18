/*
 * Routes for CMS Pages API routes
 */
var cmsApis = require('./controller')

router.get('/terms-and-conditions', cmsApis.termsAndConditions);
router.get('/privacy-policy', cmsApis.privacyPolicy);
