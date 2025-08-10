const Team = require('../Models/team')
const User = require('../Models/user')
const DeveloperTeam = require('../Models/developer_team')

// Create a new team
const createTeam = async (req, res) => {
    try {
        const { team_name, team_designation, purpose } = req.body;

        // Validate input
        if (!team_name || !team_designation || !purpose) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "All fields (team_name, team_designation, purpose) are required"
            });
        }

        // Verify the current user is a manager
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "User not found"
            });
        }

        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "Only managers can create teams"
            });
        }

        // Check if team name already exists for this manager
        const existingTeam = await Team.findOne({ manager: req.userId, team_name });
        if (existingTeam) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "You already have a team with this name"
            });
        }

        // Create the team
        const newTeam = new Team({
            manager: req.userId,
            team_name,
            team_designation,
            purpose
        });

        await newTeam.save();

        return res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: "Team created successfully",
            team: newTeam
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Get all teams for a manager
const getManagerTeams = async (req, res) => {
    try {
        console.log('getManagerTeams - User ID from request:', req.userId);
        console.log('getManagerTeams - User object from request:', req.user ? JSON.stringify(req.user) : 'undefined');

        // Verify the current user is a manager
        const user = await User.findById(req.userId);
        console.log('getManagerTeams - User found:', user ? JSON.stringify(user) : 'undefined');

        if (!user) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "User not found"
            });
        }

        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "Only managers can view their teams"
            });
        }

        // Get all teams for this manager
        console.log('getManagerTeams - Looking for teams with manager:', req.userId);
        const teams = await Team.find({ manager: req.userId }).sort({ created_at: -1 });
        console.log('getManagerTeams - Teams found:', teams.length);

        if (teams.length > 0) {
            console.log('getManagerTeams - First team:', JSON.stringify(teams[0]));
        }

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Teams fetched successfully",
            teams
        });
    } catch (error) {
        console.error('getManagerTeams - Error:', error);
        console.error('getManagerTeams - Error stack:', error.stack);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Get a single team by ID
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Team not found"
            });
        }

        // Verify the current user is the manager of this team
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You do not have permission to view this team"
            });
        }

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team fetched successfully",
            team
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Update a team
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { team_name, team_designation, purpose, status } = req.body;

        // Find the team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Team not found"
            });
        }

        // Verify the current user is the manager of this team
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You do not have permission to update this team"
            });
        }

        // Check if new team name already exists for this manager
        if (team_name && team_name !== team.team_name) {
            const existingTeam = await Team.findOne({
                manager: req.userId,
                team_name,
                _id: { $ne: id } // exclude current team
            });

            if (existingTeam) {
                return res.status(400).json({
                    responseCode: 400,
                    status: "ERROR",
                    message: "You already have a team with this name"
                });
            }
        }

        // Update the team
        if (team_name) team.team_name = team_name;
        if (team_designation) team.team_designation = team_designation;
        if (purpose) team.purpose = purpose;
        if (status && ['Active', 'Inactive'].includes(status)) team.status = status;

        await team.save();

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team updated successfully",
            team
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Get team members
const getTeamMembers = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Team not found"
            });
        }

        // Verify the current user is the manager of this team
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You do not have permission to view this team's members"
            });
        }

        // Get team members (including accepted invitations)
        const teamMemberships = await DeveloperTeam.find({
            team: id
        }).populate({
            path: 'developer',
            select: 'username email first_name last_name'
        });

        // Prepare the response data
        const members = teamMemberships.map(membership => ({
            _id: membership.developer._id,
            username: membership.developer.username,
            email: membership.developer.email,
            first_name: membership.developer.first_name,
            last_name: membership.developer.last_name,
            role: membership.role,
            joinedAt: membership.joinedAt
        }));

        // Also include the manager in the members list
        const manager = await User.findById(team.manager, 'username email first_name last_name');
        if (manager) {
            members.unshift({
                _id: manager._id,
                username: manager.username,
                email: manager.email,
                first_name: manager.first_name,
                last_name: manager.last_name,
                role: 'Manager',
                joinedAt: team.createdAt
            });
        }

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team members fetched successfully",
            members
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Delete a team
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Team not found"
            });
        }

        // Verify the current user is the manager of this team
        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You do not have permission to delete this team"
            });
        }

        // Delete the team
        await Team.findByIdAndDelete(id);

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

// Get team developers (only developers, not the manager)
const getTeamDevelopers = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('getTeamDevelopers - Team ID:', id);
        console.log('getTeamDevelopers - User ID:', req.userId);

        // Validate that id is a valid ObjectId
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "Invalid team ID format"
            });
        }

        // Find the team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Team not found"
            });
        }

        // Verify the current user is the manager of this team
        // or check if the user is a member of this team
        const isManager = team.manager.toString() === req.userId;
        if (!isManager) {
            const isMember = await DeveloperTeam.findOne({
                team: id,
                developer: req.userId
            });

            if (!isMember) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: "You do not have permission to view this team's developers"
                });
            }
        }

        // Get team developers
        const teamMemberships = await DeveloperTeam.find({
            team: id
        }).populate({
            path: 'developer',
            select: 'username email'
        });

        console.log('getTeamDevelopers - Found memberships:', teamMemberships.length);

        // Extract developer information
        const developers = teamMemberships.map(membership => {
            // Make sure the developer object exists before accessing properties
            if (!membership.developer) {
                return null;
            }

            return {
                _id: membership.developer._id,
                username: membership.developer.username,
                email: membership.developer.email,
                role: membership.role
            };
        }).filter(Boolean); // Remove null entries

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team developers fetched successfully",
            developers
        });
    } catch (error) {
        console.error('Error fetching team developers:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error: " + error.message
        });
    }
};

module.exports = {
    createTeam,
    getManagerTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    getTeamDevelopers
} 