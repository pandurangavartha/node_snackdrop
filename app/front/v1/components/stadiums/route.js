/*
 * Routes for post 
 */
var stadiumApis = require('./controller')

router.post('/get-stadium-by-location', stadiumApis.getStadiumListByLatLong);
router.post('/get-stadium-by-char', stadiumApis.getStadiumListByName);
