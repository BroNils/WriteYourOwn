let mongoose = require("mongoose");
let validation = require('mongoose-validator');
var adminScheme = new mongoose.Schema({
	username: {type:String,required:true,unique:true,
			validate: validation({
				validator: 'isLength',
				arguments: [3, 15],
				message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters',
			 })
	},
	password: {type:String,required:true},
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
module.exports = mongoose.model('Admin', adminScheme);