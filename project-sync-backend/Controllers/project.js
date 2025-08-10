const Project = require('../Models/project')
const Team = require('../Models/team')
const DeveloperTeam = require('../Models/developer_team')

// Create a new project
exports.createProject = async (req, res) => {
    try {
        console.log('Request body:', JSON.stringify(req.body));
        console.log('User object:', req.user ? JSON.stringify(req.user) : 'undefined');
        console.log('User ID:', req.userId);

        const { team, project_name, client, tech_stack, project_link, documentation_link, estimated_time, description } = req.body

        console.log('Team ID from request:', team);

        // Validate team ID
        if (!team || typeof team !== 'string' || !team.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: 'Invalid team ID format'
            });
        }

        // Verify the team exists and the current user is the manager
        const teamData = await Team.findById(team)
        console.log('Team data found:', teamData ? JSON.stringify(teamData) : 'undefined');

        if (!teamData) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Team not found'
            })
        }

        console.log('Team manager ID:', teamData.manager ? teamData.manager.toString() : 'undefined');
        console.log('Current user ID:', req.userId);

        // Check if the current user is the manager of the team
        if (teamData.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only team manager can create projects'
            })
        }

        console.log('Creating new project object');
        const project = new Project({
            team,
            project_name,
            client,
            tech_stack,
            project_link,
            documentation_link,
            estimated_time,
            description,
            created_by: req.userId
        })

        console.log('Saving project');
        await project.save()
        console.log('Project saved successfully');

        res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: 'Project created successfully',
            project
        })
    } catch (error) {
        console.error('Error in createProject:', error);
        console.error('Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        })
    }
}

// Get all projects for a manager
exports.getManagerProjects = async (req, res) => {
    try {
        console.log('getManagerProjects - User ID:', req.userId);

        // Find all teams where the current user is the manager
        const teams = await Team.find({ manager: req.userId });
        console.log('getManagerProjects - Teams found:', teams.length);

        if (!teams.length) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: "No teams found for this manager",
                projects: []
            });
        }

        const teamIds = teams.map(team => team._id);
        console.log('getManagerProjects - Team IDs:', teamIds);

        // Find all projects for these teams
        const projects = await Project.find({ team: { $in: teamIds } })
            .populate('team', 'team_name')
            .sort({ created_at: -1 });

        console.log('getManagerProjects - Projects found:', projects.length);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Projects fetched successfully",
            projects
        });
    } catch (error) {
        console.error('getManagerProjects - Error:', error);
        console.error('getManagerProjects - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all projects for a developer
exports.getDeveloperProjects = async (req, res) => {
    try {
        console.log('getDeveloperProjects - User ID:', req.userId);

        // Find all teams where the developer is a member
        const developerTeams = await DeveloperTeam.find({ developer: req.userId });
        console.log('getDeveloperProjects - Developer teams found:', developerTeams.length);

        if (!developerTeams.length) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: "No teams found for this developer",
                projects: []
            });
        }

        const teamIds = developerTeams.map(devTeam => devTeam.team);
        console.log('getDeveloperProjects - Team IDs:', teamIds);

        // Find all projects for these teams
        const projects = await Project.find({ team: { $in: teamIds } })
            .populate('team', 'team_name')
            .sort({ created_at: -1 });

        console.log('getDeveloperProjects - Projects found:', projects.length);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Projects fetched successfully",
            projects
        });
    } catch (error) {
        console.error('getDeveloperProjects - Error:', error);
        console.error('getDeveloperProjects - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        console.log('getProjectById - Project ID:', req.params.id);
        console.log('getProjectById - User ID:', req.userId);

        const project = await Project.findById(req.params.id)
            .populate('team', 'team_name team_designation')
            .populate('created_by', 'username');

        console.log('getProjectById - Project found:', project ? 'yes' : 'no');

        if (!project) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Project not found'
            });
        }

        // Verify the user has access to this project
        console.log('getProjectById - Team ID:', project.team._id);
        const isManager = await Team.exists({ _id: project.team._id, manager: req.userId });
        const isDeveloper = await DeveloperTeam.exists({ team: project.team._id, developer: req.userId });

        console.log('getProjectById - Is manager:', isManager ? 'yes' : 'no');
        console.log('getProjectById - Is developer:', isDeveloper ? 'yes' : 'no');

        if (!isManager && !isDeveloper) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You do not have access to this project'
            });
        }

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Project fetched successfully',
            project
        });
    } catch (error) {
        console.error('getProjectById - Error:', error);
        console.error('getProjectById - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Update a project
exports.updateProject = async (req, res) => {
    try {
        console.log('updateProject - Project ID:', req.params.id);
        console.log('updateProject - User ID:', req.userId);
        console.log('updateProject - Request body:', JSON.stringify(req.body));

        // Find the project
        const project = await Project.findById(req.params.id);
        console.log('updateProject - Project found:', project ? 'yes' : 'no');

        if (!project) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Project not found'
            });
        }

        // Verify the user is the manager of the team that owns this project
        const team = await Team.findById(project.team);
        console.log('updateProject - Team found:', team ? 'yes' : 'no');
        console.log('updateProject - Team manager:', team ? team.manager.toString() : 'undefined');

        if (!team || team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only team manager can update projects'
            });
        }

        // Update only the fields that are provided in the request
        const allowedFields = [
            'project_name',
            'client',
            'tech_stack',
            'project_link',
            'documentation_link',
            'estimated_time',
            'description',
            'status'
        ];

        // Log which fields are being updated
        console.log('updateProject - Fields to update:', Object.keys(req.body));

        // Update only the fields that were provided
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // For status, check that it's a valid value
                if (field === 'status') {
                    const validStatuses = ['Active', 'Completed', 'On Hold'];
                    if (validStatuses.includes(req.body[field])) {
                        project[field] = req.body[field];
                    } else {
                        console.warn(`Invalid status value provided: ${req.body[field]}`);
                    }
                } else {
                    project[field] = req.body[field];
                }
            }
        });

        console.log('updateProject - Saving updated project');
        await project.save();
        console.log('updateProject - Project updated successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('updateProject - Error:', error);
        console.error('updateProject - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        console.log('deleteProject - Project ID:', req.params.id);
        console.log('deleteProject - User ID:', req.userId);

        const project = await Project.findById(req.params.id);
        console.log('deleteProject - Project found:', project ? 'yes' : 'no');

        if (!project) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Project not found'
            });
        }

        // Verify the user is the manager of the team that owns this project
        const team = await Team.findById(project.team);
        console.log('deleteProject - Team found:', team ? 'yes' : 'no');
        console.log('deleteProject - Team manager:', team ? team.manager.toString() : 'undefined');

        if (!team || team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only team manager can delete projects'
            });
        }

        console.log('deleteProject - Deleting project');
        await Project.deleteOne({ _id: req.params.id });
        console.log('deleteProject - Project deleted successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('deleteProject - Error:', error);
        console.error('deleteProject - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
} 