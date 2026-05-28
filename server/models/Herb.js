const mongoose = require('mongoose');

const herbSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alias: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['解表药', '清热药', '泻下药', '祛风湿药', '化湿药', '利水渗湿药', '温里药', '理气药', '消食药', '补虚药', '收涩药', '安神药', '活血化瘀药', '止血药', '化痰止咳平喘药']
  },
  nature: { type: String, required: true },
  taste: { type: String, required: true },
  meridian: { type: String, default: '' },
  effect: { type: String, required: true },
  usage: { type: String, default: '' },
  caution: { type: String, default: '' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Herb', herbSchema);
