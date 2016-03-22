'use strict';

var app = require('./server');

var port = process.env.PORT || 10000;

app.listen(port, function () {
  console.log('Example app listening at port:', port);
});
