const mongoose = require('mongoose')

const developerTeamSchema = new mongoose.Schema({
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['Developer', 'Lead Developer'],
        default: 'Developer'
    },
    invitationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamInvitation'
    }
})

// Create a compound index to ensure a developer only appears once in a team
developerTeamSchema.index({ developer: 1, team: 1 }, { unique: true });

const DeveloperTeam = mongoose.model('DeveloperTeam', developerTeamSchema)
module.exports = DeveloperTeam 