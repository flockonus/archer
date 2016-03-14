var DB = new Firebase("https://graves.firebaseio.com/");
var Foo = DB.child('foo');

Foo.on('child_added', function(snapshot) {
    console.log('+',snapshot.val(), snapshot.key());
});

var r;
function cb(a){
    r = a;
    console.log(a);
}

function cbAll(){
    console.log(arguments);
}

var lastAct;

function doSpawn(){
    // https://www.firebase.com/docs/security/api/
    // https://www.firebase.com/docs/web/api/firebase/push.html
    lastAct = Foo.push({
        pId: Math.random(),
        ev: 'spawn',
        time: Firebase.ServerValue.TIMESTAMP,
        x: Math.random(),
        y: Math.random(),
    });
}