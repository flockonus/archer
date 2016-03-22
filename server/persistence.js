'use strict';

var db = levelup(__dirname+'/../eventDB', ()=>{


exports.addEvent = function(){

  return true;
};

exports.readAllEvents = function(key,value){

  return [];
};
