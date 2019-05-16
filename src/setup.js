var mongoose=require("mongoose");
var conn = require("./conn.js");
var adminScheme = require("./adminScheme.js");
var webScheme = require("./webConf.js");
var fs = require('fs');
var key = fs.readFileSync(__dirname+'/../key.lock');
var sha512 = require('js-sha512').sha512;
var nQuery;


//SETUP ADMIN
mongoose.set('useCreateIndex', true);
        
  nQuery=new adminScheme({
    "username" : "admin",
	"password" : sha512.hmac(key, '#password') //Set your password here
  });
  
  nQuery.save(function(error){
    if(error)
      console.log(error);
    
	adminScheme.find({},function(error, data){
 
		console.log(data);
	});
  });
  
//SETUP WEB
  nQuery=new webScheme({
	  link:[{
		  title: "Link 1",
		  href: "#!"
	  },
	  {
		  title: "Link 2",
		  href: "#!"
	  },
	  {
		  title: "Link 3",
		  href: "#!"
	  },
	  {
		  title: "Link 4",
		  href: "#!"
	  }/*,
	  {
		  title: "Link 5",
		  href: "#!"
	  },
	  {
		  title: "Link 6",
		  href: "#!"
	  },
	  {
		  title: "Link 7",
		  href: "#!"
	  },
	  {
		  title: "Link 8",
		  href: "#!"
	  }*/
	  ]
  });
  
  nQuery.save(function(error){
    if(error)
      console.log(error);
    
	webScheme.find({},function(error, data){
 
		console.log(data);
	});
  });