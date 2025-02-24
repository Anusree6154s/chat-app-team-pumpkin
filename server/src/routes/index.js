const express  =require('express')
const { signup } = require('../controllers/signup.controller')
const { getUsers } = require('../controllers/getUsers.controller')
const { getContacts } = require('../controllers/getContacts.controller')
const { getMessages } = require('../controllers/getMessages.controller')
const router = express.Router()

router.post('/signup', signup)
router.get('/users', getUsers)
router.get('/contacts/:userId', getContacts)
router.get('/messages', getMessages)

module.exports = router