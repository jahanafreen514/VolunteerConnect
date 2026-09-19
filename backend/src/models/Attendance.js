const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    status: { type: String, enum: ['present', 'absent'], required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

attendanceSchema.index({ opportunityId: 1, volunteerId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
