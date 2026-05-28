const express = require('express');
const Article = require('../models/Article');
const { auth, adminAuth } = require('../middleware/auth');
const { validateArticle } = require('../middleware/validate');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, keyword, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { content: new RegExp(keyword, 'i') }
      ];
    }
    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .select('-content')
      .populate('author', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ articles, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取文章列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'username');
    if (!article) return res.status(404).json({ message: '文章不存在' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: '获取文章详情失败' });
  }
});

router.post('/', auth, adminAuth, validateArticle, async (req, res) => {
  try {
    const article = new Article({ ...req.body, author: req.user._id });
    await article.save();
    res.status(201).json({ message: '发布成功', article });
  } catch (error) {
    res.status(500).json({ message: '发布文章失败', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, validateArticle, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: '文章不存在' });
    res.json({ message: '更新成功', article });
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

module.exports = router;
