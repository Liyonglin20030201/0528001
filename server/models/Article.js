const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['spring', 'summer', 'autumn', 'winter', 'qi_deficiency', 'yang_deficiency', 'yin_deficiency', 'phlegm_dampness', 'blood_stasis', 'general']
  },
  coverImage: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

articleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
