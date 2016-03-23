  'use strict';

var levelup = require('levelup');
var self = this;

// used as auto-incrementing id for every event
var evCounter;

var evDB = levelup(__dirname+'/../eventDB', {
  // compression: false
  valueEncoding: 'json',
}, function(err){
  if(err){
    console.error(err);
    process.exit(1);
  }
  evDB.createReadStream({reverse:true, limit:1})
  .on('data', function(data){
    evCounter = JSON.parse(data.value)._id;
  })
  .on('end', function(){
    console.log('evCounter:', evCounter || 0);
    if(evCounter == null){
      console.log('eventDB is empty, seeding!');
      evCounter = 0;
      self.addEvent('bigbang',{
        _localTime: Date.now(),
      });
    }
  })
});

exports.addEvent = function addEvent(type, info){
  var value = {
    _id: ++evCounter,
    _type: type,
    _time: Date.now(),
    info
  };
  // maybe do something with the _localTime?
  delete info._localTime;
  console.log('+', value._id, type, info);
  evDB.put(value._id,JSON.stringify(value));
  return true;
};

exports.getAllEvents = function getAllEvents(){
  var list = [];
  return new Promise(function(win,fail){
    evDB
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
