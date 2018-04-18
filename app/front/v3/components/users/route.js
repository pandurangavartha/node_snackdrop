/*
 * Routes for user APIs
 * All User APIs
 * 02-11-2017 
 */
var usersApis = require('./controller');

v3router.post('/register-user', usersApis.registerUser);
v3router.post('/login', usersApis.login);
v3router.post('/social-login', usersApis.socialLogin);
v3router.post('/change-password', usersApis.changePassword);
v3router.get('/get-profile', usersApis.getProfile);
v3router.put('/update-profile', usersApis.updateProfile);
v3router.get('/logout', usersApis.logout);
v3router.post('/forget-password', usersApis.forgetPassword);
v3router.post('/forget-password-verify-token', usersApis.forgotPasswordTokenCheck);
v3router.post('/forget-password-change-pwd', usersApis.forgotPasswordChangePassword);
