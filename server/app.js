require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/user');
const herbRoutes = require('./routes/herb');
const articleRoutes = require('./routes/article');
const masterRoutes = require('./routes/master');
const uploadRoutes = require('./routes/upload');
const constitutionRoutes = require('./routes/constitution');
const prescriptionRoutes = require('./routes/prescription');
const commentRoutes = require('./routes/comment');
const noteRoutes = require('./routes/note');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/user', userRoutes);
app.use('/api/herbs', herbRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/constitution', constitutionRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notes', noteRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcm_culture';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 连接成功');
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message);
    process.exit(1);
  });

module.exports = app;
