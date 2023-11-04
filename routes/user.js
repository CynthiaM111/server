const express = require('express')
const auth = require('../middleware/auth')


const router = new express.Router()
const {
  createUser,
  verifyAccount,
  schoolRegistration,
  approveAdmin,
  
  
  
  login,
  updateUser,
  logout,
  deleteUser,
  me
} = require('../controller/userController/userController')



const {
  RECOVER,
  RESET,
} = require('../controller/userController/passwordController')


router.post('/register', createUser)
router.get('/:id/verify/:token', verifyAccount)
router.get('/:id/registration/:token', schoolRegistration)
router.get('/:id/approveAdmin',approveAdmin)



router.post('/login', login)
router.post('/logout', logout)
router.post('/reset', RECOVER)
//router.post('/recover', RECOVER)
// Define the route for resetting the password
router.post('/:id/reset-password/:token', RESET);

//router.post('/reset/:token', RESET)
// router.post('/reset/:token', Resetpassword)
//router.post('/reset/:token', ResetPassword)
router.get('/me', auth, me)
router.patch('/me', auth, updateUser)
router.delete('/me', auth, deleteUser)

module.exports = router
