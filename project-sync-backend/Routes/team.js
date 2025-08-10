const router = require('express').Router()
const Team = require('../Controllers/team')
const { authMiddleware } = require('../Middlewares/auth')

router.use(authMiddleware)

router.post('/', Team.createTeam)
router.get('/', Team.getManagerTeams)
router.get('/:id', Team.getTeamById)
router.put('/:id', Team.updateTeam)
router.delete('/:id', Team.deleteTeam)
router.get('/:id/members', Team.getTeamMembers)
router.get('/:id/developers', Team.getTeamDevelopers)

module.exports = router 