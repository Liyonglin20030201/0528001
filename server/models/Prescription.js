const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['解表剂', '泻下剂', '和解剂', '清热剂', '温里剂', '补益剂', '固涩剂', '安神剂', '理气剂', '理血剂', '治风剂', '治燥剂', '祛湿剂', '祛痰剂', '消食剂', '驱虫剂']
  },
  composition: [{ herb: String, dosage: String }],
  method: { type: String, default: '' },
  effect: { type: String, required: true },
  indication: { type: String, required: true },
  analysis: { type: String, default: '' },
  caution: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

prescriptionSchema.index({ name: 'text', effect: 'text', indication: 'text' });

module.exports = mongoose.model('Prescription', prescriptionSchema);
