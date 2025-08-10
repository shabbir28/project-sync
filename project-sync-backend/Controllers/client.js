const Client = require('../Models/client')
const Team = require('../Models/team')
const User = require('../Models/user')
const DeveloperTeam = require('../Models/developer_team')

// Create a new client (manager only)
exports.createClient = async (req, res) => {
    try {
        console.log('createClient - Request body:', req.body);
        console.log('createClient - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can create clients'
            });
        }

        // Verify the team exists
        const team = await Team.findById(req.body.team);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Team not found'
            });
        }

        // Verify the manager is the team manager
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only create clients for your teams'
            });
        }

        // Create the client
        const newClient = new Client(req.body);

        console.log('createClient - Creating new client:', newClient);
        await newClient.save();
        console.log('createClient - Client created successfully');

        res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: 'Client created successfully',
            client: newClient
        });
    } catch (error) {
        console.error('createClient - Error:', error);
        console.error('createClient - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all clients for a team
exports.getTeamClients = async (req, res) => {
    try {
        console.log('getTeamClients - Team ID:', req.params.teamId);
        console.log('getTeamClients - User ID:', req.userId);

        // Verify the team exists
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Team not found'
            });
        }

        // Verify user is either the team manager or a developer in the team
        const user = await User.findById(req.userId);

        if (user.role === 'manager') {
            if (team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view clients for your teams'
                });
            }
        } else {
            // For developers, check if they're part of the team
            const isMember = await DeveloperTeam.findOne({
                developer: req.userId,
                team: req.params.teamId
            });

            if (!isMember) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view clients for teams you are a member of'
                });
            }
        }

        // Get all clients for the team
        const clients = await Client.find({ team: req.params.teamId }).sort({ created_at: -1 });

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Clients retrieved successfully',
            clients
        });
    } catch (error) {
        console.error('getTeamClients - Error:', error);
        console.error('getTeamClients - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all clients for a manager
exports.getManagerClients = async (req, res) => {
    try {
        console.log('getManagerClients - User ID:', req.userId);

        // Get all teams managed by this user
        const teams = await Team.find({ manager: req.userId });
        console.log(`getManagerClients - Found ${teams.length} teams`);

        if (teams.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No teams found',
                clients: []
            });
        }

        const teamIds = teams.map(team => team._id);

        // Get all clients for these teams
        const clients = await Client.find({ team: { $in: teamIds } })
            .populate('team', 'team_name')
            .sort({ created_at: -1 });

        console.log(`getManagerClients - Found ${clients.length} clients`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Clients retrieved successfully',
            clients
        });
    } catch (error) {
        console.error('getManagerClients - Error:', error);
        console.error('getManagerClients - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get a specific client by ID
exports.getClientById = async (req, res) => {
    try {
        console.log('getClientById - Client ID:', req.params.id);
        console.log('getClientById - User ID:', req.userId);

        const client = await Client.findById(req.params.id).populate('team', 'team_name');

        if (!client) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Client not found'
            });
        }

        // Verify user is either the team manager or a developer in the team
        const user = await User.findById(req.userId);
        const team = await Team.findById(client.team._id);

        if (user.role === 'manager') {
            if (team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view clients for your teams'
                });
            }
        } else {
            // For developers, check if they're part of the team
            const isMember = await DeveloperTeam.findOne({
                developer: req.userId,
                team: client.team._id
            });

            if (!isMember) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view clients for teams you are a member of'
                });
            }
        }

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Client retrieved successfully',
            client
        });
    } catch (error) {
        console.error('getClientById - Error:', error);
        console.error('getClientById - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Update a client (manager only)
exports.updateClient = async (req, res) => {
    try {
        console.log('updateClient - Client ID:', req.params.id);
        console.log('updateClient - User ID:', req.userId);
        console.log('updateClient - Request body:', req.body);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can update clients'
            });
        }

        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Client not found'
            });
        }

        // Verify the manager is the team manager
        const team = await Team.findById(client.team);
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only update clients for your teams'
            });
        }

        // Update allowed fields
        const allowedFields = [
            'client_name',
            'client_type',
            'client_description',
            'source'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                client[field] = req.body[field];
            }
        });

        await client.save();
        console.log('updateClient - Client updated successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Client updated successfully',
            client
        });
    } catch (error) {
        console.error('updateClient - Error:', error);
        console.error('updateClient - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Delete a client (manager only)
exports.deleteClient = async (req, res) => {
    try {
        console.log('deleteClient - Client ID:', req.params.id);
        console.log('deleteClient - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can delete clients'
            });
        }

        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Client not found'
            });
        }

        // Verify the manager is the team manager
        const team = await Team.findById(client.team);
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only delete clients for your teams'
            });
        }

        await Client.deleteOne({ _id: req.params.id });
        console.log('deleteClient - Client deleted successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('deleteClient - Error:', error);
        console.error('deleteClient - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
} 