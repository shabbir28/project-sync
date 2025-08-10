const router = require('express').Router()
const Bug = require('../Controllers/bug')
const { authMiddleware } = require('../Middlewares/auth')

// Create a new bug (manager only)
router.post('/', authMiddleware, Bug.createBug)

// Get all bugs (returns manager or developer bugs based on user role)
router.get('/', authMiddleware, (req, res) => {
    if (req.user.role === 'manager') {
        Bug.getManagerBugs(req, res)
    } else {
        Bug.getDeveloperBugs(req, res)
    }
})

// Get a specific bug by ID
router.get('/:id', authMiddleware, Bug.getBugById)

// Update a bug (managers can update any field, developers can only update status to completed)
router.patch('/:id', authMiddleware, Bug.updateBug)

// Delete a bug (manager only)
router.delete('/:id', authMiddleware, Bug.deleteBug)

module.exports = router 