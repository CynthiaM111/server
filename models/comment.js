const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true,
	},
	article: {
		type: mongoose.Schema.ObjectId,
		ref: "Article",
		required: true,
	},
	body: {
		type: String,
		require: true,
	},
	isAnonymous:{
		type:String,
		type: String,
        enum: ['Yes','No'],
        required:true,
        },
	
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
}
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;

