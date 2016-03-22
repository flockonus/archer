'use strict';

var levelup = require('levelup');

var eDB = levelup(__dirname+'/../eventDB', {
  // compression: false
});


exports.addEvent = function(data){
  var key = Date.now()+'';
  eDB.put(key,data);
  return true;
};

exports.readAllEvents = function(key,value){
  var list = [];
  return new Promise(function(win,fail){
    eDB
    .createReadStream()
    .on('data', (data) => {
      list.push(data.value);
      // console.log(`${data.key}:${data.value}`);
    })
    .on('error', function (err) {
      fail(new Error('cant stream read eventDB'));
    })
    // .on('close', function () {
    //   console.log('Stream closed');
    // })
    .on('end', function () {
      win(list);
    });
  });
};
