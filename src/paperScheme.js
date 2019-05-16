let mongoose = require("mongoose");
let validation = require('mongoose-validator');
var paperScheme = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Writer"
	},
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	util: {
		visitCount: {type:Number,default:0},
		comments: [{
			name: {type:String,default:"Anon#",
					validate: validation({
						validator: 'isLength',
						arguments: [3, 12],
						message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
					})
			},
			text: {type:String,required: true,
					validate: validation({
						validator: 'isLength',
						arguments: [1, 5000],
						message: 'Comment should be between {ARGS[0]} and {ARGS[1]} characters',
					})
			}
		}]
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});
module.exports = mongoose.model('Paper', paperScheme);