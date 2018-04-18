/*
 * Routes for guest user APIs
 * 01-12-2017 
 */
var guestUser = require('./controller');

v2router.post('/guest-user', guestUser.addGuestUser);
