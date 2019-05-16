let mongoose = require("mongoose");
let intro = "WriteYourOwn adalah sebuah aplikasi open-source yang dibuat untuk saling berbagi cerita. Dengan fitur dukungan sebuah markdown yang nantinya bisa digunakan untuk mengubah style penulisan.";
var webConfigScheme = new mongoose.Schema({
	id: {type:Number,
		 default:1,
		 unique: true
	}, //DO NOT CHANGE
	title: {type:String,
			default:"WriteYourOwn | A Storytelling Web",
			required:true
	}, //Web title
	appName: {type:String,
			  default:"WriteYourOwn",
			  required:true
	}, //App name
	metaAuthor: {type:String,
				 default:"GoogleX"
	}, //Author
	intro: {type:String,default: intro}, //About intro
	metaDescription: {type:String,
					  default:"A Storytelling Web"
	},
	link: [{
		title:String,
		href:String
	}], //Footer link (max length = 4)
	footer: {
		title: {type:String,default:"Lorem Ipsum"}, //Footer title
		desc: {type:String,default:"Dolor sit amet"} //Footer desc
	}
});
module.exports = mongoose.model('WebConfig', webConfigScheme);