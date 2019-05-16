var mongoose=require("mongoose");
var conn = require("./conn.js");
var writerScheme = require("./writerScheme.js");
var fs = require('fs');
var key = fs.readFileSync(__dirname+'/../key.lock');
var sha512 = require('js-sha512').sha512;
var nQuery;


//CREATE PLATO
mongoose.set('useCreateIndex', true);
        
  nQuery=new writerScheme({
    "username" : "plato",
	"password" : sha512.hmac(key, '#password'),
	"desc": "Philosopher",
	"location": "Athena",
	"authKey": "X"
  });
  
  nQuery.save(function(error){
    if(error)
      console.log(error);
    
	writerScheme.find({},function(error, data){
 
		console.log(data);
	});
  });
  