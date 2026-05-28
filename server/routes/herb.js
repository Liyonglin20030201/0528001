const express = require('express');
const Herb = require('../models/Herb');
const { auth, adminAuth } = require('../middleware/auth');
const { validateHerb } = require('../middleware/validate');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, keyword, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { effect: new RegExp(keyword, 'i') }
      ];
    }
    const total = await Herb.countDocuments(query);
    const herbs = await Herb.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ herbs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取药材列表失败' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Herb.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '获取分类失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const herb = await Herb.findById(req.params.id);
    if (!herb) return res.status(404).json({ message: '药材不存在' });
    res.json(herb);
  } catch (error) {
    res.status(500).json({ message: '获取药材详情失败' });
  }
});

router.post('/', auth, adminAuth, validateHerb, async (req, res) => {
  try {
    const herb = new Herb(req.body);
    await herb.save();
    res.status(201).json({ message: '添加成功', herb });
  } catch (error) {
    res.status(500).json({ message: '添加药材失败', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, validateHerb, async (req, res) => {
  try {
    const herb = await Herb.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!herb) return res.status(404).json({ message: '药材不存在' });
    res.json({ message: '更新成功', herb });
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Herb.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

module.exports = router;
