/*
 * Routes for post 
 */
var stadiumApis = require('./controller')

v2router.post('/get-stadium-by-location', stadiumApis.getStadiumListByLatLong);
v2router.post('/get-stadium-by-char', stadiumApis.getStadiumListByName);
