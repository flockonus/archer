  'use strict';

var levelup = require('levelup');
var self = this;
var lpad = require('left-pad');

// used as auto-incrementing id for every event
var evCounter;

var evDB = levelup(__dirname+'/../.db-data/eventDB', {
  // compression: false
  keyEncoding: 'binary',
  valueEncoding: 'json',
}, function(err){
  if(err){
    console.error(err);
    process.exit(1);
  }
  evDB.createReadStream({reverse:true, limit:1})
  .on('data', function(data){
    evCounter = parseInt(data.key,10);
  })
  .on('end', function(){
    if(evCounter == null){
      console.log('eventDB is empty, seeding!');
      evCounter = 0;
      self.addEvent('bigbang', {
        _time: Date.now(),
      });
    }
    console.log('evCounter:', evCounter);
  })
});

exports.addEvent = function addEvent(_type, info){
  var id = genId()
  var value = {
    // _id: genId(),
    _time: Date.now(),
    _type,
    info,
  };
  // maybe do something with the _localTime?
  delete info._localTime;
  console.log('+', id, _type, '\n', info);
  evDB.put(id,JSON.stringify(value));
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

function genId(){
  return lpad( (++evCounter)+'', 14, '0');
}
