const Task = require('../Models/task')
const Project = require('../Models/project')
const Team = require('../Models/team')
const DeveloperTeam = require('../Models/developer_team')
const User = require('../Models/user')

// Create a new task (manager only)
exports.createTask = async (req, res) => {
    try {
        console.log('createTask - Request body:', req.body);
        console.log('createTask - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can create tasks'
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
                message: 'You can only create tasks for projects in your teams'
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

        // Create the task
        const newTask = new Task({
            ...req.body,
            created_by: req.userId
        });

        console.log('createTask - Creating new task:', newTask);
        await newTask.save();
        console.log('createTask - Task created successfully');

        res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        console.error('createTask - Error:', error);
        console.error('createTask - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all tasks for a manager
exports.getManagerTasks = async (req, res) => {
    try {
        console.log('getManagerTasks - User ID:', req.userId);

        // Get all teams managed by this user
        const teams = await Team.find({ manager: req.userId });
        console.log(`getManagerTasks - Found ${teams.length} teams`);

        if (teams.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No teams found',
                tasks: []
            });
        }

        const teamIds = teams.map(team => team._id);

        // Get all projects for these teams
        const projects = await Project.find({ team: { $in: teamIds } });
        console.log(`getManagerTasks - Found ${projects.length} projects`);

        if (projects.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No projects found',
                tasks: []
            });
        }

        const projectIds = projects.map(project => project._id);

        // Get all tasks for these projects
        const tasks = await Task.find({ project_id: { $in: projectIds } })
            .populate('project_id', 'project_name')
            .populate('developer_id', 'username email')
            .sort({ created_at: -1 });

        console.log(`getManagerTasks - Found ${tasks.length} tasks`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Tasks retrieved successfully',
            tasks
        });
    } catch (error) {
        console.error('getManagerTasks - Error:', error);
        console.error('getManagerTasks - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get all tasks assigned to a developer
exports.getDeveloperTasks = async (req, res) => {
    try {
        console.log('getDeveloperTasks - User ID:', req.userId);

        // Get all tasks assigned to this developer
        const tasks = await Task.find({ developer_id: req.userId })
            .populate('project_id', 'project_name')
            .sort({ created_at: -1 });

        console.log(`getDeveloperTasks - Found ${tasks.length} tasks`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Tasks retrieved successfully',
            tasks
        });
    } catch (error) {
        console.error('getDeveloperTasks - Error:', error);
        console.error('getDeveloperTasks - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
    try {
        console.log('getTaskById - Task ID:', req.params.id);
        console.log('getTaskById - User ID:', req.userId);

        const task = await Task.findById(req.params.id)
            .populate('project_id', 'project_name')
            .populate('developer_id', 'username email');

        console.log('getTaskById - Task found:', task ? 'yes' : 'no');

        if (!task) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Task not found'
            });
        }

        // For developers, verify they are assigned to this task
        const user = await User.findById(req.userId);
        if (user.role === 'developer' && task.developer_id._id.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only view tasks assigned to you'
            });
        }

        // For managers, verify they are the team manager for this project
        if (user.role === 'manager') {
            const project = await Project.findById(task.project_id);
            const team = await Team.findById(project.team);

            if (team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only view tasks for your teams'
                });
            }
        }

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Task retrieved successfully',
            task
        });
    } catch (error) {
        console.error('getTaskById - Error:', error);
        console.error('getTaskById - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Update a task (managers can update any field, developers can only update status to completed)
exports.updateTask = async (req, res) => {
    try {
        console.log('updateTask - Task ID:', req.params.id);
        console.log('updateTask - User ID:', req.userId);
        console.log('updateTask - Request body:', req.body);

        const task = await Task.findById(req.params.id);
        console.log('updateTask - Task found:', task ? 'yes' : 'no');

        if (!task) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Task not found'
            });
        }

        const user = await User.findById(req.userId);

        // Handling developer updates (can only change status to completed)
        if (user.role === 'developer') {
            // Verify developer is assigned to this task
            if (task.developer_id.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only update tasks assigned to you'
                });
            }

            // Developers can only update status to completed
            if (req.body.status !== 'completed' || Object.keys(req.body).length > 1) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'Developers can only update task status to completed'
                });
            }

            task.status = 'completed';
        }
        // Handling manager updates (can update any field)
        else if (user.role === 'manager') {
            // Verify manager is the team manager for this project
            const project = await Project.findById(task.project_id);
            const team = await Team.findById(project.team);

            if (team.manager.toString() !== req.userId) {
                return res.status(403).json({
                    responseCode: 403,
                    status: "ERROR",
                    message: 'You can only update tasks for your teams'
                });
            }

            // Update fields provided in the request
            const allowedFields = [
                'task_name',
                'task_description',
                'expected_completion_date',
                'priority',
                'status',
                'developer_id'
            ];

            // If developer_id is being changed, verify new developer is part of the team
            if (req.body.developer_id && req.body.developer_id !== task.developer_id.toString()) {
                const isMember = await DeveloperTeam.findOne({
                    developer: req.body.developer_id,
                    team: project.team
                });

                if (!isMember) {
                    return res.status(403).json({
                        responseCode: 403,
                        status: "ERROR",
                        message: 'New developer is not a member of this project team'
                    });
                }
            }

            // Update allowed fields
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    task[field] = req.body[field];
                }
            });
        } else {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Unauthorized to update tasks'
            });
        }

        console.log('updateTask - Saving updated task');
        await task.save();
        console.log('updateTask - Task updated successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('updateTask - Error:', error);
        console.error('updateTask - Error stack:', error.stack);
        res.status(400).json({
            responseCode: 400,
            status: "ERROR",
            message: error.message
        });
    }
}

// Delete a task (manager only)
exports.deleteTask = async (req, res) => {
    try {
        console.log('deleteTask - Task ID:', req.params.id);
        console.log('deleteTask - User ID:', req.userId);

        const task = await Task.findById(req.params.id);
        console.log('deleteTask - Task found:', task ? 'yes' : 'no');

        if (!task) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: 'Task not found'
            });
        }

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can delete tasks'
            });
        }

        // Verify manager is the team manager for this project
        const project = await Project.findById(task.project_id);
        const team = await Team.findById(project.team);

        if (team.manager.toString() !== req.userId) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'You can only delete tasks for your teams'
            });
        }

        console.log('deleteTask - Deleting task');
        await Task.deleteOne({ _id: req.params.id });
        console.log('deleteTask - Task deleted successfully');

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('deleteTask - Error:', error);
        console.error('deleteTask - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
} 