const LoginActivity = require('../../models/loginActivity');
const UserStats = require('../../models/userStatsSchema');
const cron = require('node-cron');

console.log('Duration')

async function calculateAverageDuration() {
  // Calculate the average duration for students
  const studentDuration = await LoginActivity.aggregate([
    {
      $match: { userType: 'student', logoutTimestamp: { $exists: true } },
    },
    {
      $group: {
        _id: null,
        totalDuration: {
          $avg: {
            $subtract: ['$logoutTimestamp', '$loginTimestamp'],
          }, 
        },
      },
    },
  ]);

  // Calculate the average duration for instructors
  const instructorDuration = await LoginActivity.aggregate([
    {
      $match: { userType: 'instructor', logoutTimestamp: { $exists: true } },
    },
    {
      $group: {
        _id: null,
        totalDuration: {
          $avg: {
            $subtract: ['$logoutTimestamp', '$loginTimestamp'],
          },
        },
      },
    },  
  ]);

  // Get the calculated average durations
//   const avgStudentDuration = studentDuration[0].totalDuration || 0;
//   const avgInstructorDuration = instructorDuration[0].totalDuration || 0;

    const avgStudentDuration = (studentDuration[0]?.totalDuration || 0) / 60000; // Convert to minutes
    const avgInstructorDuration = (instructorDuration[0]?.totalDuration || 0) / 60000; // Convert to minutes

  // Update the UserStats document with the calculated averages
  await UserStats.updateOne({}, {
    averageStudentDuration: avgStudentDuration,
    averageTeacherDuration: avgInstructorDuration,
  });

  console.log('Average student duration (ms):', studentDuration[0].totalDuration);
  console.log('Average instructor duration (ms):', instructorDuration[0].totalDuration);
}

cron.schedule('0 3 * * 0', async () => {
    console.log('Running the calculateAverageDuration function weekly on Sunday at 3:00 AM');
    await calculateAverageDuration();
  });
