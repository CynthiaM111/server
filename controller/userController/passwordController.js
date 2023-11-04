const User = require('../../models/user') ; 
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const sendEmail = require('../../email/sendEmail')
const Token = require('../../models/token')

const RECOVER = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).send({ message: "Email not provided" });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
  
      // Check if a token already exists for this user
      const existingToken = await Token.findOne({ userId: user._id });
  
      if (existingToken) {
        return res.status(400).send({ message: "Token already exists" });
      }
  
      // Create a new token
      const token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
  
      const resetLink = `${process.env.BASE_URL}users/${user.id}/reset-password/${token.token}`;
  
      // Send the email
      await sendEmail(
        user.email,
        process.env.EMAIL,
        "Password Reset Request",
        `Dear ${user.name},\n\nYou've requested a password reset for your account. Click the link below to reset your password:\n\n${resetLink}`,
        `<p>Dear ${user.name},</p><p>You've requested a password reset for your account. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`
      );
  
      res.json({ success: true, message: "Password reset link has been sent to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
  
  

  // ...
  
  const RESET = async (req, res) => {
    console.log('RESETTING');
    try {
      const user = await User.findOne({ _id: req.params.id });
      console.log(user)
  
      if (!user) return res.status(400).send({ message: "Invalid password-reset link" });
  
      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
  
      if (!token) return res.status(400).send({ message: "Invalid verification link" });
  
      // Hash the new password before updating
      const newPassword = req.body.password; // Assuming the new password is in req.body.password
      const saltRounds = 10; // Adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      console.log(hashedPassword)
  
      // Update the hashed password in the database
      await User.updateOne({ _id: user._id }, { password: hashedPassword });
  
      await token.remove();
  
      await sendEmail(user.email, process.env.EMAIL, "Password Reset Successful", `Dear ${user.name},\n\nYou've successfully changed your Corner account password . Now you can login with the new password. `, `<p>Dear ${user.name},</p><p>You've successfully changed your Corner account password. Now you can login with the new password.</p>`);
  
      console.log('DONEEEE RESETTING');
      res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
  


module.exports = {RECOVER, RESET}





