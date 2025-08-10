const router = require('express').Router()
const Client = require('../Controllers/client')
const { authMiddleware } = require('../Middlewares/auth')

// Create a new client (manager only)
router.post('/', authMiddleware, Client.createClient)

// Get all clients for a manager
router.get('/', authMiddleware, Client.getManagerClients)

// Get all clients for a specific team
router.get('/team/:teamId', authMiddleware, Client.getTeamClients)

// Get a specific client by ID
router.get('/:id', authMiddleware, Client.getClientById)

// Update a client (manager only)
router.patch('/:id', authMiddleware, Client.updateClient)

// Delete a client (manager only)
router.delete('/:id', authMiddleware, Client.deleteClient)

module.exports = router 