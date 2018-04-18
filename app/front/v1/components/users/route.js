/*
 * Routes for user APIs
 * All User APIs
 * 02-11-2017 
 */
var usersApis = require('./controller');

router.post('/register-user', usersApis.registerUser);
router.post('/login', usersApis.login);
router.post('/social-login', usersApis.socialLogin);
router.post('/change-password', usersApis.changePassword);
router.get('/get-profile', usersApis.getProfile);
router.put('/update-profile', usersApis.updateProfile);
router.get('/logout', usersApis.logout);
router.post('/forget-password', usersApis.forgetPassword);
router.post('/forget-password-verify-token', usersApis.forgotPasswordTokenCheck);
router.post('/forget-password-change-pwd', usersApis.forgotPasswordChangePassword);
