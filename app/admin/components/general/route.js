/*
 * routes for General Controller
 */
var config = require('./controller')

app.get('/general/resize-image', config.resizeImage);
app.get('/general/crop-image', config.cropImage);
