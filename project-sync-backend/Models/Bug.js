const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    developer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bug_name: {
        type: String,
        required: true,
        trim: true
    },
    bug_description: {
        type: String,
        required: true
    },
    expected_completion_date: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Bug = mongoose.model('Bug', bugSchema)
module.exports = Bug 