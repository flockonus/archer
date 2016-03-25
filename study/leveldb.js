'use strict';

var levelup = require('levelup');

var db = levelup(__dirname+'/../.db-data/mydb', ()=>{
  console.log('START');
  console.log(db.db.getProperty('leveldb.stats'));
  console.log('');
});

const HELP_MSG = ` Choose a command:
    'read' (stream) output all keys and values
    'write10' 10x of random keys to DB in one batch
    'write1000' guess it!
`;

const command = process.argv[2];


if(!command){
  console.log(HELP_MSG);
} else if(command === 'write10'){
  write10();
} else if(command === 'writeobj'){
  // -> [object Object] -- so yes, need to encodeString
  db.put( Date.now()+'', {foo:'bar', d: new Date(), n: 1000}, (err)=>console.log(err));
} else if(command === 'write1000'){
  for (var i = 0; i < 100; i++) {
    write10();
  }
  write10();
} else if( command === 'read'){
  db
  .createReadStream()
  .on('data', (data) => {
    console.log(`${data.key}:${data.value}`);
  })
  .on('error', function (err) {
    console.log('err:', err);
  })
  .on('close', function () {
    console.log('Stream closed');
  })
  .on('end', function () {
    console.log('Stream end');
  })
} else {
  console.log(HELP_MSG);
}

function write10(){
  var i = 0;
  db
  .batch()
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .put(Math.random()+'', ++i )
  .write(function (err) {
      console.log('DONE write, error:',err);
  });
}
