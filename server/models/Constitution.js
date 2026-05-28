const mongoose = require('mongoose');

const constitutionResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  results: [{
    type: { type: String, required: true },
    score: { type: Number, required: true }
  }],
  primaryType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConstitutionResult', constitutionResultSchema);
