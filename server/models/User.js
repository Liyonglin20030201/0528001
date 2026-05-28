const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin', 'expert'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  expertInfo: {
    title: { type: String, default: '' },
    hospital: { type: String, default: '' },
    specialty: { type: String, default: '' },
    bio: { type: String, default: '' },
    certifiedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
