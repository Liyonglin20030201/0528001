const express = require('express');
const { LearningProgress, Checkin } = require('../models/Learning');
const Article = require('../models/Article');
const Herb = require('../models/Herb');
const Prescription = require('../models/Prescription');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/mark', auth, async (req, res) => {
  try {
    const { targetType, targetId, status } = req.body;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: '参数不完整' });
    }

    const updateData = { status: status || 'completed' };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { user: req.user._id, targetType, targetId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: '标记失败' });
  }
});

router.delete('/mark/:targetType/:targetId', auth, async (req, res) => {
  try {
    await LearningProgress.findOneAndDelete({
      user: req.user._id,
      targetType: req.params.targetType,
      targetId: req.params.targetId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: '取消标记失败' });
  }
});

router.get('/progress', auth, async (req, res) => {
  try {
    const { targetType } = req.query;
    const query = { user: req.user._id };
    if (targetType) query.targetType = targetType;

    const progress = await LearningProgress.find(query).sort({ createdAt: -1 });

    const articleIds = progress.filter(p => p.targetType === 'article').map(p => p.targetId);
    const herbIds = progress.filter(p => p.targetType === 'herb').map(p => p.targetId);
    const prescriptionIds = progress.filter(p => p.targetType === 'prescription').map(p => p.targetId);

    const [articles, herbs, prescriptions] = await Promise.all([
      Article.find({ _id: { $in: articleIds } }).select('title category summary'),
      Herb.find({ _id: { $in: herbIds } }).select('name category nature taste'),
      Prescription.find({ _id: { $in: prescriptionIds } }).select('name composition effect')
    ]);

    const articleMap = Object.fromEntries(articles.map(a => [a._id.toString(), a]));
    const herbMap = Object.fromEntries(herbs.map(h => [h._id.toString(), h]));
    const prescriptionMap = Object.fromEntries(prescriptions.map(p => [p._id.toString(), p]));

    const enrichedProgress = progress.map(p => {
      const item = p.toObject();
      if (p.targetType === 'article') item.target = articleMap[p.targetId.toString()];
      else if (p.targetType === 'herb') item.target = herbMap[p.targetId.toString()];
      else if (p.targetType === 'prescription') item.target = prescriptionMap[p.targetId.toString()];
      return item;
    });

    const totalArticles = await Article.countDocuments({ isPublished: true });
    const totalHerbs = await Herb.countDocuments();
    const completedArticles = progress.filter(p => p.targetType === 'article' && p.status === 'completed').length;
    const completedHerbs = progress.filter(p => p.targetType === 'herb' && p.status === 'completed').length;

    res.json({
      progress: enrichedProgress,
      stats: {
        totalArticles,
        totalHerbs,
        completedArticles,
        completedHerbs,
        totalLearning: progress.filter(p => p.status === 'learning').length,
        totalCompleted: progress.filter(p => p.status === 'completed').length
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取进度失败' });
  }
});

router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { note } = req.body;

    const existing = await Checkin.findOne({ user: req.user._id, date: today });
    if (existing) {
      return res.status(400).json({ message: '今天已经打卡过了', checkin: existing });
    }

    const checkin = new Checkin({
      user: req.user._id,
      date: today,
      note: note || ''
    });
    await checkin.save();

    const streak = await calculateStreak(req.user._id);

    res.json({ checkin, streak });
  } catch (error) {
    res.status(500).json({ message: '打卡失败' });
  }
});

router.get('/checkin', auth, async (req, res) => {
  try {
    const { month } = req.query;
    let query = { user: req.user._id };

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const checkins = await Checkin.find(query).sort({ date: -1 });
    const streak = await calculateStreak(req.user._id);
    const totalDays = await Checkin.countDocuments({ user: req.user._id });

    res.json({ checkins, streak, totalDays });
  } catch (error) {
    res.status(500).json({ message: '获取打卡记录失败' });
  }
});

async function calculateStreak(userId) {
  const checkins = await Checkin.find({ user: userId }).sort({ date: -1 }).limit(365);
  if (checkins.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (checkins.some(c => c.date === dateStr)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
