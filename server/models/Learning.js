const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['article', 'herb', 'prescription'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['learning', 'completed'], default: 'learning' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

learningProgressSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

const checkinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

checkinSchema.index({ user: 1, date: 1 }, { unique: true });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
const Checkin = mongoose.model('Checkin', checkinSchema);

module.exports = { LearningProgress, Checkin };
