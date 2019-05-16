const showdown = require('showdown'),
      xssFilter = require('showdown-xss-filter'),
      fs = require('fs'),
      sha512 = require('js-sha512').sha512;

let writerScheme = require("./writerScheme.js"),
	webScheme = require("./webConf.js"),
	paperScheme = require("./paperScheme.js"),
    adminScheme = require("./adminScheme.js"),
    key = fs.readFileSync(__dirname+'/../key.lock'),
    converter = new showdown.Converter({extensions: [xssFilter]}),
    nQuery;

module.exports = {
	wrap: fn => (req, res, next) => {
	  try {
		let result = fn(req, res, next);
		//console.log(next)
		//return (typeof next != "undefined") ? result.catch(next):null;
	  } catch (err) {
		return next(err);
	  }
	},
	noUA: (req,res,next)=>{
		if(!req.headers.hasOwnProperty("user-agent")){return res.status(406).send("NO UA DETECTED !");}
		next();
	},
    getAPI: (req,res,next)=>{
        switch(req.params.action){
			case 'searchPapers':
				if(!req.query.hasOwnProperty("q") || !req.query.hasOwnProperty("by")){return res.send("/api/searchPapers?by=title&q=keyword");}
				paperScheme.find({[req.query.by]: new RegExp(req.query.q, "i")},(error,data)=>{
					if(error){return res.status(500).send(error.toString());}
					
					res.json(data);
				}).sort({[req.query.by]: (req.query.hasOwnProperty("sort")) ? req.query.sort:'descending'}).limit((req.query.hasOwnProperty("limit")) ? Number(req.query.limit) : 3);
			break;
			case 'getWebConfig':
				webScheme.findOne({id:1},(error,data)=>{
					if(error){return res.status(500).send(error.toString());}
					
					res.json(data);
				});
			break;
            case 'getWriters':
                writerScheme.find({}, ['-password','-secure'],(error, data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                });
            break;
            case 'getWriterById':
                if(!req.query.hasOwnProperty("id")){return res.send("/api/getWriterById?id=x");}
                writerScheme.findById(req.query.id, ['-password','-secure'],(error, data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                });
            break;
            case 'getWriterByUsername':
                if(!req.query.hasOwnProperty("username")){return res.send("/api/getWriterByUsername?username=x");}
                writerScheme.findOne({"username":req.query.username}, ['-password','-secure'],(error, data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                });
            break;
            case 'getCommentByPaperId':
                if(!req.query.hasOwnProperty("id")){return res.send("/api/getCommentByPaperId?id=x");}
                paperScheme.findOne({"_id":req.query.id}, (error, data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data.util.comments);
                });
            break;
            case 'getPapers':
                paperScheme.find({},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                }).populate("author", ['-password','-secure']);
            break;
            case 'getPaperById':
                if(!req.query.hasOwnProperty("id")){return res.send("/api/getPaperById?id=x");}
                paperScheme.findById(req.query.id,(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                }).populate("author", ['-password','-secure']);
            break;
            case 'getRecentPaper':
                paperScheme.find({},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                }).sort({createdAt: 'descending'}).limit((req.query.hasOwnProperty("limit")) ? Number(req.query.limit) : 6);
            break;
            case 'getTrendingPaper':
                paperScheme.find({},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    
                    res.json(data);
                }).sort({"util.visitCount": 'descending'}).limit((req.query.hasOwnProperty("limit")) ? Number(req.query.limit) : 3);
            break;
            default:
                res.status(404).send("No API");
        }
    },
    postAPI: (req,res,next)=>{
        switch(req.params.action){
            case 'doComment':
                if(!req.body.hasOwnProperty("id") || !req.body.hasOwnProperty("comment") || !req.body.hasOwnProperty("name")){return res.status(406).send("Missing request");}
                paperScheme.findOne({"_id":req.body.id},(error, data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    if(data==null){return res.status(404).send("No paper found");}
                        
                    data.util.comments.push({name:req.body.name,text:req.body.comment});
                    data.save(function(err){
                        if(err){return res.status(500).send(error.toString());}
                            
                        res.json({"status":200,"msg":"done","data":{"name":req.body.name,"text":req.body.comment}});
                    });
                });
            break;
            case 'doLogin':
                if(!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("password") || !req.body.hasOwnProperty("randomness") || !req.body.hasOwnProperty("publickey")){return res.status(406).send("Missing request");}
                writerScheme.findOne({"username":req.body.username},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    if(data==null){return res.status(404).send("No writer found");}
                    if(data.password != sha512.hmac(key,req.body.password)){return res.json({"status":0,"msg":"Invalid password or username"});}
                    
                    data.secure.authKey = sha512.hmac(req.body.publickey,req.body.randomness.toString());
                    data.secure.createdAt = new Date();
                    data.save((error)=>{
                        if(error){return res.status(500).send(error.toString());}
                        
                        return res.json({"status":200,"msg":"Logged In"});
                    });
                });
            break;
			case 'doAdminLogin':
                if(!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("password") || !req.body.hasOwnProperty("randomness") || !req.body.hasOwnProperty("publickey")){return res.status(406).send("Missing request");}
                adminScheme.findOne({"username":req.body.username},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    if(data==null){return res.status(404).send("Invalid password or username!");}
                    if(data.password != sha512.hmac(key,req.body.password)){return res.json({"status":0,"msg":"Invalid password or username"});}
                    
                    data.secure.authKey = sha512.hmac(req.body.publickey,req.body.randomness.toString());
                    data.secure.createdAt = new Date();
                    data.save((error)=>{
                        if(error){return res.status(500).send(error.toString());}
                        
                        return res.json({"status":200,"msg":"Logged In"});
                    });
                });
            break;
            case 'doWrite':
                if(!req.body.hasOwnProperty("authKey") || !req.body.hasOwnProperty("content") || !req.body.hasOwnProperty("title")){return res.status(406).send("Missing request");}
                writerScheme.findOne({"secure.authKey":req.body.authKey},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    if(data==null){return res.json({"status":0,"msg":"Invalid authKey"});}
                    if((new Date() - new Date(data.secure.createdAt)) > 5*60*1000) {
                       return res.json({"status":0,"msg":"Your authKey has expired"});
                    }
                    
                    nQuery = new paperScheme({
                        author: data._id,
                        title: req.body.title,
                        content: converter.makeHtml(req.body.content)
                    });
                    
                    nQuery.save((error,result)=>{
                        if(error){return res.status(500).send(error.toString());}
                        
                        return res.json({"status":200,"msg":"Published","data":{"_id":result._id,title: req.body.title,content: req.body.content}});
                    });
                });
            break;
            case 'doChanges':
                if(!req.body.hasOwnProperty("authKey") || !req.body.hasOwnProperty("displayname") || !req.body.hasOwnProperty("imgurl") || !req.body.hasOwnProperty("desc") || !req.body.hasOwnProperty("location")){return res.status(406).send("Missing request");}
                writerScheme.findOne({"secure.authKey":req.body.authKey},(error,data)=>{
                    if(error){return res.status(500).send(error.toString());}
                    if(data==null){return res.json({"status":0,"msg":"Invalid authKey"});}
                    if((new Date() - new Date(data.secure.createdAt)) > 5*60*1000) {
                       return res.json({"status":0,"msg":"Your authKey has expired"});
                    }

                    data.displayName = req.body.displayname;
                    data.img.url = req.body.imgurl;
                    data.desc = req.body.desc;
                    data.location = req.body.location;
                    data.save((error)=>{
                        if(error){return res.status(500).send(error.toString());}

                        data.secure = null;
                        data.password = null;
                        return res.json({"status":200,"msg":"Success","data":data});
                    });
                });
            break;
            case 'doCreateUser':
                if(!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("password")){return res.status(406).send("Missing request");}
                nQuery = new writerScheme({
                    "username" : req.body.username,
                    "password" : sha512.hmac(key, req.body.password)
                });

                nQuery.save((error)=>{
                    if(error){return res.status(500).send(error.toString());}

                    return res.json({"status":200,"msg":"Success","data":{"username": req.body.username,"password": req.body.password}});
                });
            break;
			case 'updateWebConfig':
				if(!req.body.hasOwnProperty("authKey")){return res.status(406).send("Missing request");}
				adminScheme.findOne({"secure.authKey":req.body.authKey},(error,data)=>{
					if(error){return res.status(500).send(error.toString());}
					if(data==null){return res.json({"status":0,"msg":"Invalid authKey"});}
					if((new Date() - new Date(data.secure.createdAt)) > 5*60*1000) {
                       return res.json({"status":0,"msg":"Your authKey has expired"});
                    }
					
					webScheme.findOne({id:1},(error,data)=>{
						if(error){return res.status(500).send(error.toString());}
						
						let link;
						data.metaAuthor = "GoogleX";
						try{
							(req.body.hasOwnProperty("title")) ? (data.title = req.body.title || data.title):null;
							(req.body.hasOwnProperty("appName")) ? (data.appName = req.body.appName || data.appName):null;
							(req.body.hasOwnProperty("footerTitle")) ? (data.footer.title = req.body.footerTitle || data.footer.title):null;
							(req.body.hasOwnProperty("footerDesc")) ? (data.footer.desc = req.body.footerDesc || data.footer.desc):null;
							(req.body.hasOwnProperty("intro")) ? (data.intro = req.body.intro || data.intro):null;
							(req.body.hasOwnProperty("metaDescription")) ? (data.metaDescription = req.body.metaDescription || data.metaDescription):(data.metaDescription = "A Storytelling Web");
							(req.body.hasOwnProperty("link")) ? (link = JSON.parse(req.body.link),(Array.isArray(link) && link.length == 4) ? (data.link = link):null):null;
						}catch(e){
							return res.status(500).send(e.toString());
						}
						data.save(async (error)=>{
							if(error){return res.status(500).send(error.toString());}
							
							return res.json({"status":200,"msg":"Success","data":await webScheme.findOne({id:1}).exec()});
						});
					});
				});
			break;
            default:
                res.status(404).send("No API");
        }
    }
};