const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team_name: {
        type: String,
        required: true,
        trim: true
    },
    team_designation: {
        type: String,
        required: true,
        trim: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

const Team = mongoose.model('Team', teamSchema)
module.exports = Team 