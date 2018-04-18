/*
 * Routes for post 
 */
var stadiumApis = require('./controller')

v3router.post('/get-stadium-by-location', stadiumApis.getStadiumListByLatLong);
v3router.post('/get-stadium-by-char', stadiumApis.getStadiumListByName);
