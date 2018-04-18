/*
 * @desc Routes for Common Admin user APIs
 *  API : admin login to system
 *  API : get admin profile details 
 *  API : update admin profile details
 *  For Super Admin and Vendor Admin
 */
var users = require('./controller')

app.post('/admin-login', users.adminLogin);
app.get('/admin-profile', users.adminProfile);
app.post('/change-password', users.changePassword);
app.put('/update-admin-profile', users.updateAdminProfile);
app.post('/forget-password', users.adminForgetPassword);
app.post('/forget-password-verify-token', users.adminForgotPasswordTokenCheck);
app.post('/forget-password-change-pwd', users.adminForgotPasswordChangePassword);
app.get('/dashboard',users.getDashboardSuperAdmin);
app.get('/dash/:vendorDetailsId',users.getDashboardVendorAdmin)


