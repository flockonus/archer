'use strict';

var app = require('./server/express.js');

var server = require('http').Server(app);

require('./server/sockets.js')(server);

var port = process.env.PORT || 10000;

server.listen(port, function () {
  console.log('Example app listening at port:', port);
});
