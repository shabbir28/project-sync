const router = require('express').Router()
const User = require('../Controllers/user')
const { authMiddleware, logoutMiddleware } = require('../Middlewares/auth')

router.post('/signup', User.SignUp)
router.post('/login', User.Login)
router.post('/logout', logoutMiddleware)
router.post('/forgot-password', User.ForgotPassword)
router.post('/reset-password', User.ResetPassword)
router.get('/profile', authMiddleware, User.GetProfile)
router.get('/manager-developers', authMiddleware, User.getManagerDevelopers)
router.get('/developer-stats', authMiddleware, User.getDeveloperStats)
router.put('/status/:id', authMiddleware, User.ChangeStatus)

module.exports = router 