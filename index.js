/* WriteYourOwn

|
|
|
|
*/
const express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	mongoose = require("mongoose"),
	conn = require("./src/conn.js"),
	helmet = require("helmet"),
	apicache = require('apicache'),
	fs = require('fs'),
	mobileDet = require('./src/isMobile.js');

var app = express(),
	api = require('./src/apiRoutes.js'),
	webScheme = require("./src/webConf.js"),
	paperScheme = require("./src/paperScheme.js");
	
/* ss-cache */	
var cache = apicache.options({headers: {'cache-control': 'no-cache'}}).middleware;

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
app.use(helmet.hidePoweredBy({setTo: 'Apache'}));
app.use(helmet.noCache({noEtag: true}));
app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(api.noUA);
app.use(mobileDet.isCallerMobile);
app.use('/assets',express.static('./public/assets'));
app.use('/bootstrap',express.static('./public/bootstrap'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', 'pages');
app.set('view engine', 'ejs');
app.set( 'port', ( process.env.PORT || 5000 ));

app.route("/read/:id").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error, webdata)=>{
		if(error){return res.status(500).send(error.toString());}
		if(req.params.id=="viewtest"){return res.render("read",{"pathAsset":"../","webdata":data});}
		
		paperScheme.findOne({"_id":req.params.id},(error, data)=>{
			if(error){return res.status(500).send(error.toString());}
			if(data==null){return res.status(404).send("No paper found");}
			
			paperScheme.findOneAndUpdate({"_id":req.params.id},{ $inc: { "util.visitCount":1} } ).exec();
			res.render("read",{"pathAsset":"../","webdata":webdata,"paper":data});
		}).populate("author");
	});
});

app.route("/creator").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error,data)=>{
		if(error){return res.status(500).send(error.toString());}
		
		res.render("create",{"pathAsset":"./","webdata":data});
	})
});

app.route("/user").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error,data)=>{
		if(error){return res.status(500).send(error.toString());}
		
		res.render("user",{"pathAsset":"./","webdata":data});
	})
});

app.route("/admin").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error,data)=>{
		if(error){return res.status(500).send(error.toString());}
		
		res.render("admin",{"pathAsset":"./","webdata":data,"isMobile":req.isMobile});
	})
});

app.route("/papers").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error, webdata)=>{
		if(error){return res.status(500).send(error.toString());}
		
		res.render("papers",{"pathAsset":"./","webdata":webdata,"isMobile":req.isMobile});
	});
});

app.route("/api/:action")
.get(cache(10),api.wrap(api.getAPI))
.post(cache(10),api.wrap(api.postAPI));

app.route("/").get(cache(10),(req,res,next)=>{
	webScheme.findOne({"id":1},(error,data)=>{
		if(error){return res.status(500).send(error.toString());}
		
		res.render("index",{"pathAsset":"./","data":data});
	})
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

// handling
app.use((err, req, res, next) => {
	let { message } = err;
	res.status(err.httpStatus || 406).json({
		status: false,
		code: err.httpStatus || 406,
		message,
		data: err.previousError,
	});
	  
	try{
		fs.appendFileSync('./log/error.log', err.message+" <> "+new Date()+require('os').EOL);
		console.log("There is an error saved in error.log");
	}catch(e){
		console.log("Error while saving log");
	}
});

app.listen(app.get( 'port' ), function() {
    console.log('\nREADY !\nServer running on 127.0.0.1:'+app.get( 'port' ))
});

process.on('uncaughtException', function(err) {
	console.log("uncaughtERR");
});