const jwt = require('jsonwebtoken')
const User = require('../models/user')

require('dotenv').config()

const auth = async (req, res, next) => {
  try {
    const authorization = req.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.substring(7)
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    const user = await User.findOne({ _id: decoded._id })

    const invalidToken = await User.findOne({
      _id: decoded._id,
      invalidatedTokens: token
    })

    if (invalidToken)
      return res.status(401).send({ error: 'Please authenticate.' })

    if (!user) {
      throw new Error('Please Register first')
    }

    req.token = token
    req.user = user
    next()
  } catch (e) {
    // console.log(authorization)
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

const isResetTokenValid = async (req, res, next) =>{
  const{token, id} = req.query;
  if(!token || !id) return res.status(401).send({ error: 'Invalid request' })
  
  if (!isValidObjectId(id)) return res.status(401).send({ error: 'Invalid user' });

  const user = await User.findById(id)
  if(!user) return res.status(401).send({ error: 'User not found' })

  const tokenReset = await resetToken.findOne({owner:user._id})
  if(!tokenReset) return res.status(401).send({ error: 'Token not found!' })
  
const isValid = await tokenReset.compareToken(token)
if(!isValid) return res.status(401).send({ error: 'Token not valid!' })

req.user = user
next()
}

module.exports = auth
