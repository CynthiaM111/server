const Course = require('../../models/course')
const Announcements = require('../../models/announcement')
const UserStats = require('../../models/userStatsSchema')
const {
  subscribe,
  pushNotification,
  createNotification,
  editNotification,
  deleteNotification,
  broadcastToUsers,
  getNotificationsOfUser
} = require('../notificationController/notificationController')

const getAllAnnouncements = async (req, res) => {
  try {
    const courseId = req.params.courseId
    const course = await Course.findOne({ _id: courseId }).exec()
    const announcements = await Announcements.find({ course: course })
      .populate('user')
      .exec()
    res.status(200).send(announcements)
  } catch (e) {
    res.status(400).send('cannot get announcements: ' + e)
  }
}

const addAnnouncement = async (req, res) => {
  try {
    const user = req.user
    const courseId = req.body.courseId
    const data = req.body.data
    const course = await Course.findOne({ _id: courseId }).exec()
    const title=req.body.title;
    const announcement = new Announcements({
      user: user,
      course: course,
      data: data,
      title:title
    })
    await announcement.save()

    for (let i = 0; i < course.enrollments.length; i++) {
      if (!(course.enrollments[i].user._id === req.user._id)) {
        pushNotification(
          course.enrollments[i].user,
          JSON.stringify({
            title: course.name + ' has a new ANNOUNCEMENT'
          }),
          'admin'
        )
      }
    }
    await UserStats.updateOne({}, {
      $inc: {numberOfAnnouncements : 1 },
  });
  

    res.status(201).send(announcement)
  } catch (e) {
    res.status(400).send('cannot create anouncement: ' + e)
  }
}

const removeAnnouncement = async (req, res) => {
  try {
    const id = req.params.id
    await Announcements.findByIdAndDelete(id).exec()
    res.status(201).send('removed')
  } catch (e) {
    res.status(400).send('cannot remove announcement: ' + e)
  }
}

const editAnnouncement = async (req, res) => {
  try {
    const id = req.body.id
    const annNew = req.body.new
    await Announcements.findByIdAndUpdate(id, annNew).exec()
    annNew = await Announcements.findById(annNew._id).populate('user').exec()
    res.status(201).send(annNew)
  } catch (e) {
    res.status(400).send('cannot edit announcement: ' + e)
  }
}
const searchAnnouncements = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const keywords = req.query.keywords; // Get search keywords from query params
    const course = await Course.findOne({ _id: courseId }).exec();
    const announcements = await Announcements.find({ course: course })
      .populate('user')
      .or([
        { title: { $regex: keywords, $options: 'i' } }, // Case-insensitive title search
        { data: { $regex: keywords, $options: 'i' } },  // Case-insensitive content search
      ])
      .exec();

    res.status(200).send(announcements);
  } catch (e) {
    res.status(400).send('Cannot search announcements: ' + e);
  }
};

module.exports = {
  getAllAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  editAnnouncement,
  //searchAnnouncements
}
