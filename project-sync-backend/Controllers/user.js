const User = require('../Models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const { userJwtSecret } = require('../config')
const Team = require('../Models/team')
const DeveloperTeam = require('../Models/developer_team')
const Project = require('../Models/project')
const Task = require('../Models/task')
const Bug = require('../Models/bug')
const crypto = require('crypto');

// Sign Up
const SignUp = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body

        if (!username || username.length < 3) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Username must be at least 3 characters" });
        }

        if (!email || !email.includes('@')) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Valid email is required" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Password must be at least 8 characters" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Passwords do not match" });
        }

        if (!role || !['manager', 'developer'].includes(role)) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Role must be either manager or developer" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Email already used" });
        }

        const salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: secPassword,
            role
        })

        await newUser.save();
        return res.status(200).json({ responseCode: 200, status: "REGISTERED", message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !email.includes('@')) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Valid email is required" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Password must be at least 8 characters" });
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ responseCode: 404, status: "ERROR", message: "User not found" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({ responseCode: 401, status: "ERROR", message: "Invalid credentials" });
        }

        const userToken = jwt.sign({
            data: user.id
        }, userJwtSecret, { expiresIn: '12h' });

        return res.status(200)
            .cookie("userToken", userToken, { httpOnly: true, withCredentials: true })
            .json({ responseCode: 200, status: "LOGIN_SUCCESS", message: "Login successful", userId: user._id, role: user.role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

// Get user profile
const GetProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ responseCode: 404, status: "NOT_FOUND", message: "User not found" });
        }
        res.status(200).json({ responseCode: 200, status: "FETCHED", message: "User profile fetched successfully", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

// Change user status
const ChangeStatus = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ responseCode: 404, status: "NOT_FOUND", message: "User not found" });
        }
        user.status = user.status === "Enable" ? "Disable" : "Enable";
        await user.save()
        res.status(202).json({ responseCode: 202, status: "UPDATED", message: "User status updated successfully", user })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

// Get all developers working in any teams managed by the requesting manager
const getManagerDevelopers = async (req, res) => {
    try {
        console.log('getManagerDevelopers - User ID:', req.userId);

        // Verify user is a manager
        const user = await User.findById(req.userId);
        if (user.role !== 'manager') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only managers can access this information'
            });
        }

        // Get all teams managed by this user
        const teams = await Team.find({ manager: req.userId });
        console.log(`getManagerDevelopers - Found ${teams.length} teams`);

        if (teams.length === 0) {
            return res.status(200).json({
                responseCode: 200,
                status: "SUCCESS",
                message: 'No teams found',
                developers: []
            });
        }

        const teamIds = teams.map(team => team._id);

        // Get all developer-team relationships for these teams
        const developerTeams = await DeveloperTeam.find({ team: { $in: teamIds } })
            .populate('developer', 'username email createdAt');

        console.log(`getManagerDevelopers - Found ${developerTeams.length} developer-team relationships`);

        // Extract unique developers
        const developers = [];
        const developerIds = new Set();

        developerTeams.forEach(dt => {
            if (dt.developer && !developerIds.has(dt.developer._id.toString())) {
                developerIds.add(dt.developer._id.toString());
                developers.push(dt.developer);
            }
        });

        console.log(`getManagerDevelopers - Found ${developers.length} unique developers`);

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Developers retrieved successfully',
            developers
        });
    } catch (error) {
        console.error('getManagerDevelopers - Error:', error);
        console.error('getManagerDevelopers - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
}

// Get dashboard statistics for a developer
const getDeveloperStats = async (req, res) => {
    try {
        console.log('getDeveloperStats - User ID:', req.userId);

        // Verify user is a developer
        const user = await User.findById(req.userId);
        if (user.role !== 'developer') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: 'Only developers can access this information'
            });
        }

        // 1. Get all developer-team memberships
        const developerTeams = await DeveloperTeam.find({ developer: req.userId });
        console.log(`getDeveloperStats - Found ${developerTeams.length} teams for this developer`);

        // 2. Get all team IDs
        const teamIds = developerTeams.map(dt => dt.team);

        // 3. Get all teams with managers
        const teams = await Team.find({ _id: { $in: teamIds } }).populate('manager', 'username email');

        // 4. Get unique managers
        const uniqueManagers = new Map();
        teams.forEach(team => {
            if (team.manager) {
                uniqueManagers.set(team.manager._id.toString(), team.manager);
            }
        });
        const managers = Array.from(uniqueManagers.values());

        // 5. Get all projects for these teams
        const projects = await Project.find({ team: { $in: teamIds } });
        console.log(`getDeveloperStats - Found ${projects.length} projects for this developer`);

        // 6. Get all tasks assigned to this developer
        const tasks = await Task.find({ developer_id: req.userId });
        const tasksByStatus = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'completed').length,
            inProgress: tasks.filter(task => task.status === 'in progress').length,
            toDo: tasks.filter(task => task.status === 'to do').length
        };

        // 7. Get all bugs assigned to this developer
        const bugs = await Bug.find({ developer_id: req.userId });
        const bugsByStatus = {
            total: bugs.length,
            active: bugs.filter(bug => bug.status === 'active').length,
            completed: bugs.filter(bug => bug.status === 'completed').length
        };

        // 8. Compile the statistics
        const stats = {
            teams: {
                count: teams.length,
                list: teams.map(team => ({
                    id: team._id,
                    name: team.team_name,
                    designation: team.team_designation
                }))
            },
            managers: {
                count: managers.length,
                list: managers.map(manager => ({
                    id: manager._id,
                    name: manager.username,
                    email: manager.email
                }))
            },
            projects: {
                count: projects.length,
                list: projects.map(project => ({
                    id: project._id,
                    name: project.project_name
                }))
            },
            tasks: tasksByStatus,
            bugs: bugsByStatus
        };

        res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: 'Developer statistics retrieved successfully',
            stats
        });
    } catch (error) {
        console.error('getDeveloperStats - Error:', error);
        console.error('getDeveloperStats - Error stack:', error.stack);
        res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: error.message
        });
    }
};

// Forgot Password (stub)
const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Valid email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            // Always respond with success to prevent email enumeration
            return res.status(200).json({ responseCode: 200, status: "SUCCESS", message: "If this email exists, a reset link will be sent." });
        }
        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        // TODO: Send email with link
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        console.log(`Password reset link for ${email}: ${resetLink}`);
        // Respond
        return res.status(200).json({ responseCode: 200, status: "SUCCESS", message: "If this email exists, a reset link will be sent." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

const ResetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "All fields are required." });
        }
        if (password.length < 8) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Password must be at least 8 characters." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Passwords do not match." });
        }
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ responseCode: 400, status: "ERROR", message: "Invalid or expired token." });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        return res.status(200).json({ responseCode: 200, status: "SUCCESS", message: "Password has been reset successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error" });
    }
}

module.exports = {
    SignUp,
    Login,
    GetProfile,
    ChangeStatus,
    getManagerDevelopers,
    getDeveloperStats,
    ForgotPassword,
    ResetPassword
} 