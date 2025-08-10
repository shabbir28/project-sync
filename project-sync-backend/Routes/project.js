const router = require('express').Router()
const Project = require('../Controllers/project')
const { authMiddleware } = require('../Middlewares/auth')

router.post('/', authMiddleware, Project.createProject)

router.get('/', authMiddleware, (req, res) => {
    if (req.user.role === 'manager') {
        Project.getManagerProjects(req, res)
    } else {
        Project.getDeveloperProjects(req, res)
    }
})
router.get('/:id', authMiddleware, Project.getProjectById)
router.patch('/:id', authMiddleware, Project.updateProject)
router.delete('/:id', authMiddleware, Project.deleteProject)

module.exports = router 