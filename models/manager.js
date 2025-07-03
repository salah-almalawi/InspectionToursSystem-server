const mongoose = require('mongoose');
const { Schema } = mongoose;

const ManagerSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        rank: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        lastRounds: [{ type: Schema.Types.ObjectId, ref: 'InspectionRound' }]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Manager', ManagerSchema);