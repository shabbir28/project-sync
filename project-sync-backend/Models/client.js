const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    client_name: {
        type: String,
        required: true,
        trim: true
    },
    client_type: {
        type: String,
        enum: ['Local', 'Freelance'],
        required: true
    },
    client_description: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

const Client = mongoose.model('Client', clientSchema)
module.exports = Client 