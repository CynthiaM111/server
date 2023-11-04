const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginActivitySchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId, // Assuming you're using ObjectIds for user IDs
    required: true,
  },
  userType: {
    type: String, // You can use 'student' or 'teacher' as user types
    required: true,
  },
  loginTimestamp: {
    type: Date,
    default: Date.now,
  },
  logoutTimestamp: {
    type: Date,
  },
  logoutTimestamp: {
    type: Date,
  },
  // You can add any other relevant information about the login activity here
});

const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);

module.exports = LoginActivity;
