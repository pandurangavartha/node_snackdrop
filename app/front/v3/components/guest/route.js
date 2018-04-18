/*
 * Routes for guest user APIs
 * 01-12-2017 
 */
var guestUser = require('./controller');

v3router.post('/guest-user', guestUser.addGuestUser);
