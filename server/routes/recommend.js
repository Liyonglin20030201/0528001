const express = require('express');
const ConstitutionResult = require('../models/Constitution');
const BrowseHistory = require('../models/BrowseHistory');
const Article = require('../models/Article');
const Herb = require('../models/Herb');
const Prescription = require('../models/Prescription');
const { auth } = require('../middleware/auth');

const router = express.Router();

const constitutionHerbMap = {
  qi_deficiency: ['补虚药'],
  yang_deficiency: ['温里药', '补虚药'],
  yin_deficiency: ['补虚药', '清热药'],
  phlegm_dampness: ['化湿药', '利水渗湿药'],
  damp_heat: ['清热药', '利水渗湿药'],
  blood_stasis: ['活血化瘀药', '理气药'],
  qi_stagnation: ['理气药', '安神药'],
  special: ['解表药', '补虚药'],
  balanced: ['补虚药']
};

const constitutionArticleMap = {
  qi_deficiency: ['qi_deficiency'],
  yang_deficiency: ['yang_deficiency', 'winter'],
  yin_deficiency: ['yin_deficiency', 'autumn'],
  phlegm_dampness: ['phlegm_dampness', 'summer'],
  blood_stasis: ['blood_stasis', 'spring'],
  balanced: ['general']
};

router.post('/browse', auth, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: '参数不完整' });
    }

    await BrowseHistory.findOneAndUpdate(
      { user: req.user._id, targetType, targetId },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: '记录浏览失败' });
  }
});

router.get('/personal', auth, async (req, res) => {
  try {
    const constitution = await ConstitutionResult.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });

    const browseHistory = await BrowseHistory.find({ user: req.user._id })
      .sort({ lastViewedAt: -1 })
      .limit(50);

    let recommendedHerbs = [];
    let recommendedArticles = [];

    if (constitution) {
      const herbCategories = constitutionHerbMap[constitution.primaryType] || ['补虚药'];
      recommendedHerbs = await Herb.find({ category: { $in: herbCategories } })
        .limit(8);

      const articleCategories = constitutionArticleMap[constitution.primaryType] || ['general'];
      recommendedArticles = await Article.find({
        category: { $in: articleCategories },
        isPublished: true
      }).sort({ viewCount: -1 }).limit(8);
    }

    if (recommendedArticles.length < 8) {
      const existingIds = recommendedArticles.map(a => a._id);
      const moreArticles = await Article.find({
        _id: { $nin: existingIds },
        isPublished: true
      }).sort({ viewCount: -1 }).limit(8 - recommendedArticles.length);
      recommendedArticles = [...recommendedArticles, ...moreArticles];
    }

    if (recommendedHerbs.length < 8) {
      const existingIds = recommendedHerbs.map(h => h._id);
      const moreHerbs = await Herb.find({
        _id: { $nin: existingIds }
      }).limit(8 - recommendedHerbs.length);
      recommendedHerbs = [...recommendedHerbs, ...moreHerbs];
    }

    const viewedArticleIds = browseHistory
      .filter(h => h.targetType === 'article')
      .map(h => h.targetId);
    const viewedHerbIds = browseHistory
      .filter(h => h.targetType === 'herb')
      .map(h => h.targetId);

    let historyBasedArticles = [];
    if (viewedArticleIds.length > 0) {
      const viewedArticles = await Article.find({ _id: { $in: viewedArticleIds.slice(0, 5) } });
      const viewedCategories = [...new Set(viewedArticles.map(a => a.category))];
      historyBasedArticles = await Article.find({
        category: { $in: viewedCategories },
        _id: { $nin: viewedArticleIds },
        isPublished: true
      }).sort({ viewCount: -1 }).limit(4);
    }

    let historyBasedHerbs = [];
    if (viewedHerbIds.length > 0) {
      const viewedHerbs = await Herb.find({ _id: { $in: viewedHerbIds.slice(0, 5) } });
      const viewedCategories = [...new Set(viewedHerbs.map(h => h.category))];
      historyBasedHerbs = await Herb.find({
        category: { $in: viewedCategories },
        _id: { $nin: viewedHerbIds }
      }).limit(4);
    }

    res.json({
      constitution: constitution ? {
        primaryType: constitution.primaryType,
        testDate: constitution.createdAt
      } : null,
      recommendedHerbs,
      recommendedArticles,
      historyBasedArticles,
      historyBasedHerbs,
      recentlyViewed: browseHistory.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: '获取推荐失败' });
  }
});

module.exports = router;
