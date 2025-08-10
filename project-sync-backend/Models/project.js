const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    project_name: {
        type: String,
        required: true,
        trim: true
    },
    client: {
        type: String,
        required: true,
        trim: true
    },
    tech_stack: {
        type: String,
        required: true,
        trim: true
    },
    project_link: {
        type: String,
        trim: true
    },
    documentation_link: {
        type: String,
        trim: true
    },
    estimated_time: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'On Hold'],
        default: 'Active'
    }
})

const Project = mongoose.model('Project', projectSchema)
module.exports = Project 