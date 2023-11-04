const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatsSchema = new Schema({
  studentsCount: {
    type: Number,
    default: 0,
  },
  teachersCount: {
    type: Number,
    default: 0,
  },
  weeklyActiveStudents: {
    type: Number,
    default: 0,
  },
  weeklyActiveInstructors: {
    type: Number,
    default: 0,
  },
  averageStudentDuration: {
    type: Number,
    default: 0, // You can set a default value or leave it as 0 initially
  },
  averageTeacherDuration: {
    type: Number,
    default: 0, // You can set a default value or leave it as 0 initially
  },
  questionsAskedByStudents: {
    type: Number,
    default: 0,
  },
  questionResponseTime: {
    type: Number,
    default: 0,
  },
  numberOfAnnouncements: {
    type: Number,
    default: 0,
  },
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
