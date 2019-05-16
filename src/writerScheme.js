let mongoose = require("mongoose");
let validation = require('mongoose-validator');
var writerScheme = new mongoose.Schema({
	username: {type:String,required:true,unique:true,
			validate: validation({
				validator: 'isLength',
				arguments: [3, 15],
				message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters',
			 })
	},
	password: {type:String,required:true},
	displayName: {type:String,required:true,default:"Plato",
			validate: validation({
				validator: 'isLength',
				arguments: [3, 20],
				message: 'Displayname should be between {ARGS[0]} and {ARGS[1]} characters',
			 })
	},
	img: {
		type: {type:String,default: "url"}, //if type = url then url can't be blank. same as another type
		url: {type:String,default: "https://images.gr-assets.com/authors/1393978633p5/879.jpg"},
		data: Buffer
	},
	desc: {type:String,
			validate: validation({
				validator: 'isLength',
				arguments: [3, 60],
				message: 'Desc should be between {ARGS[0]} and {ARGS[1]} characters',
			})
	},
	location: {type:String,
			validate: validation({
				validator: 'isLength',
				arguments: [3, 60],
				message: 'Location should be between {ARGS[0]} and {ARGS[1]} characters',
			})
	},
	secure: {
		authKey: {type:String},
		createdAt: {
			type: Date,
			default: Date.now
		}
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});
module.exports = mongoose.model('Writer', writerScheme);