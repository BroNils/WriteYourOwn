var mongoose=require("mongoose");
var conn = require("./conn.js");
var writerScheme = require("./writerScheme.js");
var paperScheme = require("./paperScheme.js");
var nQuery;


//CREATE PAPER
mongoose.set('useCreateIndex', true);
       
	writerScheme.find({},function(error, data){
 
		//console.log(data);
		nQuery=new paperScheme({
			"author" : data[0]._id,
			"title" : "Lorem Ipsum",
			"content" : "<blockquote>Dolor Sit Amet</blockquote>"
		  });
		  
		nQuery.save(async function(error){
			if(error) throw error;
			
			
			paperScheme.find({title:"Lorem Ipsum"},function(error,data){
				if(error) throw error;
				
				data[0].title = "TX";
				data[0].util.comments.push({name:"Tes",text:"TesX"});
				data[0].save();
				paperScheme.find({},function(error,data){
					if(error) throw error;
					
					console.log(data);
				}).populate("author");
			}).populate("author");
		});
	});
  