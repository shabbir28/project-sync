const Bug = require('../Models/bug')
const Project = require('../Models/project')
const Team = require('../Models/team')
const DeveloperTeam = require('../Models/developer_team')
const User = require('../Models/user')

// Create a new bug (manager only)
exports.createBug = async (req, res) => {
    try {
        console.log('createBug - Request body:', req.body);
        console.log('createBug - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can create bugs'
            });
        }

        // Verify the project exists
        const project = await Project.findById(req.body.project_id);
        if (!project) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Project not found'
            });
        }

        // Verify the manager is the team manager for this project
        const team = await Team.findById(project.team);
        if (!team || team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only create bugs for projects in your teams'
            });
        }

        // Verify the developer exists and is part of the team
        const developer = await User.findById(req.body.developer_id);
        if (!developer) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Developer not found'
            });
        }

        // Check if developer is a team member
        const isMember = await DeveloperTeam.findOne({
            developer: req.body.developer_id,
            team: project.team
        });

        if (!isMember) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Developer is not a member of this project team'
            });
        }

        // Create the bug
        const newBug = new Bug({
            ...req.body,
            created_by: req.userId
        });

        console.log('createBug - Creating new bug:', newBug);
        await newBug.save();
        console.log('createBug - Bug created successfully');

        res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: 'Bug created successfully',
            bug: newBug
        });
    } catch (error) {
        console.error('createBug - Error:', error);
        console.error('createBug - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all bugs for a manager
exports.getManagerBugs = async (req, res) => {
    try {
        console.log('getManagerBugs - User ID:', req.userId);

        // Get all teams managed by this user
        const teams = await Team.find({ manager: req.userId });
        console.log(`getManagerBugs - Found ${teams.length} teams`);

        if (teams.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No teams found',
                bugs: []
            });
        }

        const teamIds = teams.map(team => team._id);

        // Get all projects for these teams
        const projects = await Project.find({ team: { $in: teamIds } });
        console.log(`getManagerBugs - Found ${projects.length} projects`);

        if (projects.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No projects found',
                bugs: []
            });
        }

        const projectIds = projects.map(project => project._id);

        // Get all bugs for these projects
        const bugs = await Bug.find({ project_id: { $in: projectIds } })
            .populate('project_id', 'project_name')
            .populate('developer_id', 'username email')
            .sort({ created_at: -1 });

        console.log(`getManagerBugs - Found ${bugs.length} bugs`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Bugs retrieved successfully',
            bugs
        });
    } catch (error) {
        console.error('getManagerBugs - Error:', error);
        console.error('getManagerBugs - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all bugs assigned to a developer
exports.getDeveloperBugs = async (req, res) => {
    try {
        console.log('getDeveloperBugs - User ID:', req.userId);

        // Get all bugs assigned to this developer
        const bugs = await Bug.find({ developer_id: req.userId })
            .populate('project_id', 'project_name')
            .sort({ created_at: -1 });

        console.log(`getDeveloperBugs - Found ${bugs.length} bugs`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Bugs retrieved successfully',
            bugs
        });
    } catch (error) {
        console.error('getDeveloperBugs - Error:', error);
        console.error('getDeveloperBugs - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get a specific bug by ID
exports.getBugById = async (req, res) => {
    try {
        console.log('getBugById - Bug ID:', req.params.id);
        console.log('getBugById - User ID:', req.userId);

        const bug = await Bug.findById(req.params.id)
            .populate('project_id', 'project_name')
            .populate('developer_id', 'username email');

        console.log('getBugById - Bug found:', bug ? 'yes' : 'no');

        if (!bug) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Bug not found'
            });
        }

        // Check if the user is authorized to view this bug
        const user = await User.findById(req.userId);

        if (user.role === 'developer' && bug.developer_id.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only view bugs assigned to you'
            });
        }

        if (user.role === 'manager') {
            // Check if the manager is the team manager for this bug's project
            const project = await Project.findById(bug.project_id);
            if (!project) {
                return res.status(404).json({
                    responseCode: 404,
                    status: "ERROR",
                    message: 'Project not found'
                });
            }

            const team = await Team.findById(project.team);
            if (!team || team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view bugs for projects in your teams'
                });
            }
        }

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Bug retrieved successfully',
            bug
        });
    } catch (error) {
        console.error('getBugById - Error:', error);
        console.error('getBugById - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Update a bug (managers can update any field, developers can only update status to completed)
exports.updateBug = async (req, res) => {
    try {
        console.log('updateBug - Bug ID:', req.params.id);
        console.log('updateBug - User ID:', req.userId);
        console.log('updateBug - Request body:', req.body);

        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Bug not found'
            });
        }

        const user = await User.findById(req.userId);

        // If user is a developer
        if (user.role === 'developer') {
            // Developer can only update bugs assigned to them, and only the status field to 'completed'
            if (bug.developer_id.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only update bugs assigned to you'
                });
            }

            // Only allow updating status to completed
            if (Object.keys(req.body).length > 1 || !Object.keys(req.body).includes('status')) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'As a developer, you can only update the status to completed'
                });
            }

            if (req.body.status && req.body.status !== 'completed') {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'As a developer, you can only mark a bug as completed'
                });
            }

            bug.status = 'completed';
        }
        // If user is a manager
        else if (user.role === 'manager') {
            // Check if the manager is the team manager for this bug's project
            const project = await Project.findById(bug.project_id);
            if (!project) {
                return res.status(404).json({
                    responseCode: 404,
                    status: "ERROR",
                    message: 'Project not found'
                });
            }

            const team = await Team.findById(project.team);
            if (!team || team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only update bugs for projects in your teams'
                });
            }

            // If changing developer, verify the new developer is part of the team
            if (req.body.developer_id && req.body.developer_id !== bug.developer_id.toString()) {
                const isMember = await DeveloperTeam.findOne({
                    developer: req.body.developer_id,
                    team: project.team
                });

                if (!isMember) {
                    return res.status(403).json({
                        responseCode: 403,
                        status: "ERROR",
                        message: 'The new developer must be a member of this project team'
                    });
                }
            }

            // Update all fields provided
            Object.keys(req.body).forEach(key => {
                bug[key] = req.body[key];
            });
        } else {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Unauthorized'
            });
        }

        await bug.save();
        console.log('updateBug - Bug updated successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Bug updated successfully',
            bug
        });
    } catch (error) {
        console.error('updateBug - Error:', error);
        console.error('updateBug - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Delete a bug (manager only)
exports.deleteBug = async (req, res) => {
    try {
        console.log('deleteBug - Bug ID:', req.params.id);
        console.log('deleteBug - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can delete bugs'
            });
        }

        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Bug not found'
            });
        }

        // Check if the manager is the team manager for this bug's project
        const project = await Project.findById(bug.project_id);
        if (!project) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Project not found'
            });
        }

        const team = await Team.findById(project.team);
        if (!team || team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only delete bugs for projects in your teams'
            });
        }

        await Bug.findByIdAndDelete(req.params.id);
        console.log('deleteBug - Bug deleted successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Bug deleted successfully'
        });
    } catch (error) {
        console.error('deleteBug - Error:', error);
        console.error('deleteBug - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}
