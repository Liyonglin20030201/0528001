const mongoose = require('mongoose');

const masterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dynasty: { type: String, required: true },
  portrait: { type: String, default: '' },
  biography: { type: String, required: true },
  contribution: { type: String, default: '' },
  stories: [{ type: String }],
  famousWorks: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Master', masterSchema);
