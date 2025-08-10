const router = require('express').Router()
const Task = require('../Controllers/task')
const { authMiddleware } = require('../Middlewares/auth')

// Create a new task (manager only)
router.post('/', authMiddleware, Task.createTask)

// Get all tasks (returns manager or developer tasks based on user role)
router.get('/', authMiddleware, (req, res) => {
    if (req.user.role === 'manager') {
        Task.getManagerTasks(req, res)
    } else {
        Task.getDeveloperTasks(req, res)
    }
})

// Get a specific task by ID
router.get('/:id', authMiddleware, Task.getTaskById)

// Update a task (managers can update any field, developers can only update status to completed)
router.patch('/:id', authMiddleware, Task.updateTask)

// Delete a task (manager only)
router.delete('/:id', authMiddleware, Task.deleteTask)

module.exports = router 