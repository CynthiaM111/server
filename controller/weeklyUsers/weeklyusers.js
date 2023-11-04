const UserStats = require('../../models/userStatsSchema');
const Discussions = require('../../models/Discussions')
const LoginActivity = require('../../models/loginActivity'); // Assuming you have a model for login activity
const cron = require('node-cron');

console.log('Croning')

async function updateWeeklyCounts() {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Calculate the date one week ago

  const studentsCount = await LoginActivity.countDocuments({
    userType: 'student', // Assuming you have a field for user type in LoginActivity
    loginTimestamp: { $gte: lastWeek, $lte: now },
  });

  const teachersCount = await LoginActivity.countDocuments({
    userType: 'instructor', // Assuming you have a field for user type in LoginActivity
    loginTimestamp: { $gte: lastWeek, $lte: now },
  });

  // Update the UserStats document with the counts
  await UserStats.updateOne({}, {
    weeklyActiveStudents: studentsCount,
    weeklyActiveInstructors: teachersCount,
  });
}
cron.schedule('0 3 * * 0', async () => {
    console.log('Running the weekly update task');
    await updateWeeklyCounts();
  });

console.log('Response Time')
const calculateWeeklyAverageResponseTime = async () => {
    // Calculate the start and end date for the past week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Find discussions created within the past week
    const discussions = await Discussions.find({
        createdAt: { $gte: startDate, $lte: endDate },
    }).exec();

    // Calculate the average response time for these discussions
    let totalResponseTime = 0;
    let totalResponses = 0;
    
    discussions.forEach((discussion) => {
        discussion.responseTimes.forEach((responseTime) => {
            totalResponseTime += responseTime;
            totalResponses += 1;
        });
    });

    const weeklyAverageResponseTime = totalResponseTime / totalResponses;
    const userStats = await UserStats.findOne().exec();
    userStats.questionResponseTime = weeklyAverageResponseTime/60000;
    await userStats.save();
    

    console.log(`Weekly Average Response Time: ${weeklyAverageResponseTime} ms`);
};

// Call this function periodically, for example, once a week
// You can use a scheduling library (e.g., node-cron) to schedule this function


// cron.schedule('0 3 * * 0', async () => {
//     console.log('Running the weekly response time');
//     await calculateQuestionResponseTime();
//   });
cron.schedule('0 3 * * 0', async () => {
    console.log('Running the weekly update');
    await calculateWeeklyAverageResponseTime();
    });





