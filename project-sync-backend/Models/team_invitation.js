const mongoose = require('mongoose')

const teamInvitationSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitedEmail: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    responseDate: {
        type: Date,
        default: null
    }
})

// Create a compound index to ensure a user can only be invited once to a team (while invitation is pending)
teamInvitationSchema.index({ team: 1, invitedEmail: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Pending' } });

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema)
module.exports = TeamInvitation 