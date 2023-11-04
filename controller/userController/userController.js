

const User = require('../../models/user')
const Token = require('../../models/token')
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const resetToken = require('../../models/resetToken')
const axios = require('axios')
const sendEmail = require('../../email/sendEmail');
const UserStats=require('../../models/userStatsSchema')
const LoginActivity=require('../../models/loginActivity')
const updateWeeklyCounts = require('../weeklyUsers/weeklyusers'); // Update the path as per your project structure
const averagetime=require('../../controller/weeklyUsers/averageDur')



require('dotenv').config()

//const awsEmailResisterUrl = '';

const createUser = async (req, res) => {
  console.log('CREATING USERRRRR')
  try {
    const user = new User(req.body)
    user.code = Date.now()
    await user.save()
    const token = await new Token({
			userId: user._id,
			token: crypto.randomBytes(32).toString("hex"),
		}).save();
    //const BASE_URL = `${req.protocol}://${req.get('host')}`;

    //Find the UserStats document for the user or create it if it doesn't exist
    let stats = await UserStats.findOne();

    if (!stats) {
      // If it doesn't exist, create and initialize it
      stats = new UserStats({
        userId: user._id,
        studentsCount: 0,
        teachersCount: 0,
      });
    }

    // Increment the counts based on the user's role
    if (user.role === 'student') {
      stats.studentsCount += 1;
    } else if (user.role === 'instructor') {
      stats.teachersCount += 1;
    }
    await User.updateOne({ _id: user._id }, { isEmailRegistered: true });

    // Save the updated or new UserStats document
    await stats.save();


    if(user.role==='admin'){
     
      const adLink = `${process.env.BASE_URL}users/${user.id}/registration/${token.token}`;
      await sendEmail(user.email, process.env.EMAIL, "Welcome to Corner:University Registration",`Please click the following link to register the university: ${adLink}`,
    `<p>Please click the following link to register the university:</p><a href="${adLink}">${adLink}</a>`
     );

    } else{
		const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
		await sendEmail(user.email, process.env.EMAIL, "Welcome to Corner:Account Verification",`Please click the following link to verify your account: ${url}`,
    `<p>Please click the following link to verify your account:</p><a href="${url}">${url}</a>`
     );}

    const token1 = await user.generateAuthToken();
    res.status(201).send({ user, token1 });
    
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Internal Server Error" });
	}

  }

  const schoolRegistration = async (req, res) => {
    console.log("EXEEEEEEC")
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(400).send({ message: 'Invalid verification link' });
      }
  
      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
  
      if (!token) {
        return res.status(400).send({ message: 'Invalid verification link' });
      }
      await user.save();
      await token.remove();
      
     await User.updateOne({ _id: user._id }, {univeristy:req.body.university} , {linkedinProfilelink:req.body.linkedinProfilelink});
  
      //user.isEmailRegistered = true; // Mark the user as verified (optional depending on your application's logic)
      //await User.updateOne({ _id: user._id }, { isApproved: false });
      // user.university = req.body.university;
      
      // user.linkedinProfilelink = req.body.linkedinProfilelink;
      await user.save();
      console.log(user)
      await token.remove();
  
      const adminName = user.name; 
      const adminEmail = user.email; 
      const adminUni=user.university;
      const approveLink = `${process.env.BASE_URL}users/${user._id}/approveAdmin`;
      await sendEmail(
        process.env.SUPER_EMAIL,
        process.env.EMAIL,
        "New Admin Registration Request",
        `A new admin registration request has been received from ${adminName}:${adminEmail},${adminUni}. Click the following link to approve: ${approveLink}`,
        `<p>A new admin registration request has been received from ${adminName}:${adminEmail},${adminUni}.</p><p>Click the following link to approve:</p><a href="${approveLink}">${approveLink}</a>`
      );
      // console.log('2nd EMAIL SENT')
  
      // Respond with a success message
      res.status(200).send({ message: 'School registration successful' });
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
  const approveAdmin = async (req, res) => {
    console.log('APPROVE ADMIN')
    try {
      const user = await User.findById(req.params.id);
      const adminUni=user.university;
  
      if (!user || user.role !== 'admin') {
        await sendEmail(
          user.email,
          process.env.EMAIL,
          "Your  Admin Registration Request Denied!!!",
          `Your request to register as a ${adminUni} admin on Corner has been denied. If you disagree with this decision, send an email to corner.e.learning@gmail.com.`,
          `<p>Your request to register as a ${adminUni} admin on Corner has been denied.</p><p>If you disagree with this decision, send an email to corner.e.learning@gmail.com.</p>`);
    
        return res.status(400).send({ message: 'Invalid admin ID' });
      }
  
      // Update the 'isEmailRegistered' field to true to approve the admin
      await User.updateOne({ _id: user._id }, { isEmailRegistered: true });
      await sendEmail(
        user.email,
        process.env.EMAIL,
        "Your  Admin Registration Request Accepted!",
        `Your request to register as a ${adminUni} admin on Corner has been accepted. Now you can go back to Corner to login.`,
        `<p>Your request to register as a ${adminUni} admin on Corner has been accepted.</p><p> Now you can go back to Corner to login.</p>`);
  
      console.log('EMAIL SHOULBE SSENT')
      await user.save();
  
      // Respond with a success message
      res.status(200).send({ message: 'Admin approval successful' });
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
  
    const verifyAccount = async (req, res) => {
      console.log('VERIFYINNNNGGGGUSE')
      try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send({ message: "Invalid verification link" });
    
        const token = await Token.findOne({
          userId: user._id,
          token: req.params.token,
        });
        if (!token) return res.status(400).send({ message: "Invalid verification link" });
    
        // Update the 'isEmailRegistered' field to true using the correct update syntax
        await User.updateOne({ _id: user._id }, { isEmailRegistered: true });
        await token.remove();
        console.log('DONEEEE VERFIIIYING')
    
        res.status(200).send({ message: "Email verified successfully" });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    };
    




const login = async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    if (!user || !user.isEmailRegistered) {
      // If the user is not found or their email is not registered, send an error response
      return res.status(401).send({ message: "Please verify your email before logging in." });
    }

    if (user.role === 'admin') {
      // If the user is an admin, they can log in directly
      const token = await user.generateAuthToken();
      return res.send({ user, token });
    }

    // If the user is a student or instructor, check for an admin with the same university
    // const university = user.university;
    // const admin = await User.findOne({ role: 'admin', university, isEmailRegistered: true });

    // if (!admin) {
    //   // If no admin with the same university and registered email is found, deny login
      
    //   return res.status(401).send({ message: "Please contact your university admin for access." });
    // }
    // User successfully logged in, now record the login activity
    const userId = user._id; // Get the user's ID
    const userType = user.role; // Assuming 'role' represents user type (student, instructor)
    
    // Create a new LoginActivity document to record the login
    const loginActivity = new LoginActivity({
      userId,
      userType,
    });

    await loginActivity.save(); // Save the login activity

    //await updateWeeklyCounts();

   
    const token = await user.generateAuthToken()
    res.send({ user, token })


  } catch (e) {
    res.status(400).send()
    console.log(e)
  }
}

const logout = async (req, res) => {
  try {
    let token
    const authorization = req.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.substring(7)
    }
    const decoded = jwt.decode(token)
    const user = await User.findOne({ _id: decoded._id })

    if (!user) return res.status(400).send('token is corrupted')

    const alreadyInvalidated = await User.find({ invalidatedTokens: token })

    if (alreadyInvalidated.length === 0) user.invalidatedTokens.push(token)

    user.invalidatedTokens = user.invalidatedTokens.filter((token) => {
      const { exp } = jwt.decode(token)
      if (Date.now() >= exp * 1000) return false
      else return true
    })
    // Add the code to update the logout time in the LoginActivity model
    
    const userId = user._id; // Get the user's ID
    
    const loginActivity = await LoginActivity.findOneAndUpdate(
      { userId, logoutTimestamp: null },
      { $set: { logoutTimestamp: new Date() } },
    );

    if (!loginActivity) {
      // Handle the case where a corresponding login activity was not found
      return res.status(404).send({ message: 'No active login session found.' });
    }

    await user.save()

    res.send('You Logged out');
  } catch (e) {
    res.status(500).send({ error: e.message || e.toString() });
  }
}



const updateUser = async (req, res) => {
  try {
    const id = req.user._id
    const usr = req.body
    const userOld = await User.findById(id).exec()
    const user = await User.findByIdAndUpdate(id, usr, { new: true }).exec()
    const token = await user.generateAuthToken()

    if (user.email !== userOld.email || !(user.isEmailRegistered)){
      axios.post(awsEmailResisterUrl, {
          InstructorEmail: user.email
        })
        .then(res => {
          console.log('email resistered: ' + res)
          User.findByIdAndUpdate(id, { isEmailRegistered :true }).exec()
        })
        .catch(err => {
          console.log("can't resister email: " + err)
          User.findByIdAndUpdate(id, { isEmailRegistered: false }).exec()
        })
    }else{
      console.log("email is not changed or already registered")
    }

    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
}

const deleteUser = async (req, res) => {
  try {
    await req.user.remove()
    res.status(200).send('Deleted thanks')
  } catch (e) {
    res.status(500).send('invalid Email')
  }
}

const me = async (req, res) => {
  res.send(req.user)
}



module.exports = {
  createUser,
  schoolRegistration,
  approveAdmin,
  verifyAccount,
  
  
  login,
  updateUser,
  logout,
  deleteUser,
  me
}
