const express = require('express')
const router = express.Router()
const Invitation = require('../Controllers/invitation')
const { authMiddleware } = require('../Middlewares/auth')

router.use(authMiddleware);

router.post('/', Invitation.createInvitation);
router.get('/user', Invitation.getUserInvitations);
router.get('/team/:teamId', Invitation.getTeamInvitations);
router.put('/:invitationId/accept', Invitation.acceptInvitation);
router.put('/:invitationId/reject', Invitation.rejectInvitation);
router.get('/teams/developer', Invitation.getDeveloperTeams);

module.exports = router 