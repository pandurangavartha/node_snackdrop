/*
 * Routes for user APIs
 * All User APIs
 * 02-11-2017 
 */
var usersApis = require('./controller');

v2router.post('/register-user', usersApis.registerUser);
v2router.post('/login', usersApis.login);
v2router.post('/social-login', usersApis.socialLogin);
v2router.post('/change-password', usersApis.changePassword);
v2router.get('/get-profile', usersApis.getProfile);
v2router.put('/update-profile', usersApis.updateProfile);
v2router.get('/logout', usersApis.logout);
v2router.post('/forget-password', usersApis.forgetPassword);
v2router.post('/forget-password-verify-token', usersApis.forgotPasswordTokenCheck);
v2router.post('/forget-password-change-pwd', usersApis.forgotPasswordChangePassword);
