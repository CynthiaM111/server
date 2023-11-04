const express = require('express')
const auth = require('../middleware/auth')
const {
  getAllAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  editAnnouncement,
  //searchAnnouncements
} = require('../controller/announcementsController/announcementsController')

const AnnouncementsRouter = new express.Router()

AnnouncementsRouter.get('/getAll/:courseId', auth, getAllAnnouncements)
AnnouncementsRouter.post('/add', auth, addAnnouncement)
AnnouncementsRouter.delete('/remove/:id', auth, removeAnnouncement)
AnnouncementsRouter.put('/edit', auth, editAnnouncement)
//AnnouncementsRouter.get('/search/:courseId',auth,searchAnnouncements)

module.exports = AnnouncementsRouter
