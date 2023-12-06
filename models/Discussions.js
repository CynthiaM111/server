const mongoose = require('mongoose')
const discussionsCommentsSchema = require('./DiscussionsComments')

const discussionsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        course: {
            type: mongoose.Schema.ObjectId,
            ref: "Course",
            required: true,
        },
        category: {
            type: String,
            enum: ['Lecture', 'General', 'Assignment', 'Exam'],
            required: true,
          },
        title:{
            type:String,
            required:true,
        },
        answered: {
            type: Boolean,
            default: false,
          },
        
        isAnonymous: {
            type: String,
            enum: ['Yes','No'],
            required:true,
        },
        isPrivate: {
            type: String,
            enum: ['Yes','No'],
            required:true,
        },

        responseTimes: [{ type: Number }], // Store response times in milliseconds
    
        data: {
           // type: mongoose.Schema.Types.Mixed,
            type:String,
            required: true,
        },
        comments: [discussionsCommentsSchema]
    },
    {
        timestamps: true,
    }
)

const Discussions = mongoose.model('Discussions', discussionsSchema)

module.exports = Discussions
