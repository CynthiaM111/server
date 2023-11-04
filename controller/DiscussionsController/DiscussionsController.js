const Course = require('../../models/course')
const Discussions = require('../../models/Discussions')
const UserStats = require('../../models/userStatsSchema');



const getAllDiscussions = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findOne({_id: courseId}).exec()
        const discussions = await Discussions.find({ course: course })
          .populate('user')
          .populate('comments.user')
          .exec()
        res.status(200).send(discussions)
    } catch (e) {
        res.status(400).send("cant get discussions: "+e)
    }
}

const addDiscussion = async (req, res) => {
    try {
        const user = req.user;
        const courseId = req.body.courseId;
        const data = req.body.data;
        const category = req.body.category;
        const title=req.body.title;
        const isAnonymous = req.body.isAnonymous;
        const course = await Course.findOne({_id: courseId}).exec()

        // Check if the user is a student
        if (user.role === 'student') {
            // Increment the questionsAskedByStudents field in UserStats
            await UserStats.updateOne({}, {
                $inc: { questionsAskedByStudents: 1 },
            });
            
        }
        const discussion = new Discussions({user: user, course: course, data: data, category: category, title:title, isAnonymous: isAnonymous});
        
        await discussion.save()
        res.status(201).send(discussion)
    } catch (e) {
          
       
        res.status(400).send("can't create discussion: "+e)
    }
}


const editDiscussion = async (req, res) => {
    try {
        const id = req.body.id;
        const disNew = req.body.new;
        await Discussions.findByIdAndUpdate(id, disNew).exec()
        disNew = await Discussions.findById(disNew._id)
          .populate('user')
          .populate('comments.user')
          .exec()
        res.status(201).send(disNew)
    } catch (e) {
        res.status(400).send("cant edit discussion: "+e)
    }
}

const removeDiscussion = async (req, res) => {
    try {
        const id = req.params.id;
        await Discussions.findByIdAndDelete(id).exec()
        res.status(201).send("removed")
    } catch (e) {
        res.status(400).send("cant remove discussion: "+e)
    }
}

const addComment = async (req, res) => {
    try{
        const user = req.user;
        const discussionId = req.body.discussionId;
        const comment = req.body.comment;
        const isAnonymous=req.body.isAnonymous;
        comment.user = user;
        const discussion = await Discussions.findById(discussionId)
          .populate('user')
          .populate('comments.user')
          .exec()
        discussion.comments.push(comment);
        // Check if the commenting user is an instructor
        if (user.role === 'instructor') {
        // Mark the discussion as answered
        discussion.answered = true;
        
       //Calculate and store the question response time
        const timeElapsed = Date.now() - discussion.createdAt.getTime(); // Calculate time in milliseconds
        console.log(timeElapsed)
        discussion.responseTimes.push(timeElapsed);
      }
        await Discussions.findByIdAndUpdate(discussionId,discussion).exec()
        res.status(201).send(discussion)
    } catch (e){
        res.status(400).send("cant create comment: "+e)
    }
}

const removeComment = async (req, res) => {
    try{
        const discussionId = req.params.discussionId;
        console.log(discussionId)
        const commentId = req.params.commentId;
        console.log(commentId)
        const discussion = await Discussions.findById(discussionId)
          .populate('user')
          .populate('comments.user')
          .exec()
        discussion.comments = discussion.comments.filter((value)=>{ 
            return value._id != commentId;
        });
        await Discussions.findByIdAndUpdate(discussionId,discussion).exec()
        res.status(201).send(discussion)
    } catch (e){
        res.status(400).send("cant remove comment: "+e)
    }
}

const editComment = async (req, res) => {
    try{
        const discussionId = req.body.discussionId;
        const commentNew = req.body.new;
        const commentOld = req.body.old;
        const discussion = await Discussions.findById(discussionId)
          .populate('user')
          .populate('comments.user')
          .exec()
        discussion.comments = discussion.comments.map((value)=>{ 
            if (value._id===commentOld._id){return commentNew}
            else{return value}
        });
        await Discussions.findByIdAndUpdate(discussionId,discussion).exec()
        res.status(201).send(discussion)
    } catch (e){
        res.status(400).send("cant remove comment: "+e)
    }
}

module.exports = { getAllDiscussions, addDiscussion, addComment,
     removeComment, removeDiscussion, editDiscussion, editComment }