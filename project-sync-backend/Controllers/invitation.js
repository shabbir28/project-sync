const Team = require('../Models/team')
const User = require('../Models/user')
const TeamInvitation = require('../Models/team_invitation')
const DeveloperTeam = require('../Models/developer_team')

const createInvitation = async (req, res) => {
    try {
        const { teamId, email } = req.body;

        if (!teamId || !email) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "Team ID and email are required"
            });
        }

        // Verify the team exists and belongs to the current manager
        const team = await Team.findOne({ _id: teamId, manager: req.userId });
        if (!team) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "Team not found or you don't have permission to invite to this team"
            });
        }

        const invitedUser = await User.findOne({ email });
        if (!invitedUser) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "No user found with this email address"
            });
        }

        if (invitedUser.role !== 'developer') {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "Only developers can be invited to teams"
            });
        }

        // Check if the developer is already in the team
        const existingMembership = await DeveloperTeam.findOne({
            developer: invitedUser._id,
            team: teamId
        });

        if (existingMembership) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "This developer is already a member of the team"
            });
        }

        // Check for existing pending invitation
        const existingInvitation = await TeamInvitation.findOne({
            team: teamId,
            invitedEmail: email,
            status: 'Pending'
        });

        if (existingInvitation) {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: "An invitation is already pending for this email"
            });
        }

        // Create the invitation
        const invitation = new TeamInvitation({
            team: teamId,
            invitedBy: req.userId,
            invitedEmail: email
        });

        await invitation.save();

        return res.status(201).json({
            responseCode: 201,
            status: "SUCCESS",
            message: "Invitation sent successfully",
            invitation
        });
    } catch (error) {
        console.error('Error creating invitation:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

/**
 * Get all pending invitations for the current user
 */
const getUserInvitations = async (req, res) => {
    try {
        // Get the current user's email
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "User not found"
            });
        }

        // Find all pending invitations for the user's email
        const invitations = await TeamInvitation.find({
            invitedEmail: user.email,
            status: 'Pending'
        }).populate({
            path: 'team',
            select: 'team_name team_designation purpose'
        }).populate({
            path: 'invitedBy',
            select: 'username email'
        });

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Invitations retrieved successfully",
            invitations
        });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

/**
 * Get all invitations sent by a manager for a specific team
 */
const getTeamInvitations = async (req, res) => {
    try {
        const { teamId } = req.params;

        // Verify team exists and belongs to manager
        const team = await Team.findOne({ _id: teamId, manager: req.userId });
        if (!team) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "Team not found or you don't have permission"
            });
        }

        // Get all invitations for the team
        const invitations = await TeamInvitation.find({
            team: teamId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Team invitations retrieved successfully",
            invitations
        });
    } catch (error) {
        console.error('Error fetching team invitations:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

/**
 * Accept a team invitation
 */
const acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Find the invitation
        const invitation = await TeamInvitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Invitation not found"
            });
        }

        // Verify the current user is the invited user
        const user = await User.findById(req.userId);
        if (!user || user.email !== invitation.invitedEmail) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You don't have permission to accept this invitation"
            });
        }

        // Make sure invitation is still pending
        if (invitation.status !== 'Pending') {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: `This invitation has already been ${invitation.status.toLowerCase()}`
            });
        }

        // Update invitation status
        invitation.status = 'Accepted';
        invitation.responseDate = new Date();
        await invitation.save();

        // Create team membership
        const teamMembership = new DeveloperTeam({
            developer: user._id,
            team: invitation.team,
            invitationId: invitation._id
        });

        await teamMembership.save();

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Invitation accepted successfully",
            teamMembership
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

/**
 * Reject a team invitation
 */
const rejectInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Find the invitation
        const invitation = await TeamInvitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "Invitation not found"
            });
        }

        // Verify the current user is the invited user
        const user = await User.findById(req.userId);
        if (!user || user.email !== invitation.invitedEmail) {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "You don't have permission to reject this invitation"
            });
        }

        // Make sure invitation is still pending
        if (invitation.status !== 'Pending') {
            return res.status(400).json({
                responseCode: 400,
                status: "ERROR",
                message: `This invitation has already been ${invitation.status.toLowerCase()}`
            });
        }

        // Update invitation status
        invitation.status = 'Rejected';
        invitation.responseDate = new Date();
        await invitation.save();

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Invitation rejected successfully"
        });
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

/**
 * Get a developer's teams
 */
const getDeveloperTeams = async (req, res) => {
    try {
        // Verify the current user is a developer
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                responseCode: 404,
                status: "ERROR",
                message: "User not found"
            });
        }

        if (user.role !== 'developer') {
            return res.status(403).json({
                responseCode: 403,
                status: "ERROR",
                message: "Access denied. Only developers can view their teams."
            });
        }

        // Get all teams the developer is a member of
        const teamMemberships = await DeveloperTeam.find({
            developer: req.userId
        }).populate({
            path: 'team',
            select: 'team_name team_designation purpose status',
            populate: {
                path: 'manager',
                select: 'username email'
            }
        });

        return res.status(200).json({
            responseCode: 200,
            status: "SUCCESS",
            message: "Developer teams retrieved successfully",
            teams: teamMemberships.map(membership => ({
                ...membership.team.toObject(),
                role: membership.role,
                joinedAt: membership.joinedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching developer teams:', error);
        return res.status(500).json({
            responseCode: 500,
            status: "ERROR",
            message: "Server error"
        });
    }
};

module.exports = {
    createInvitation,
    getUserInvitations,
    getTeamInvitations,
    acceptInvitation,
    rejectInvitation,
    getDeveloperTeams
}; 