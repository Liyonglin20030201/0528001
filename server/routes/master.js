const express = require('express');
const Master = require('../models/Master');
const { auth, adminAuth } = require('../middleware/auth');
const { validateMaster } = require('../middleware/validate');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { dynasty, page = 1, limit = 10 } = req.query;
    const query = {};
    if (dynasty) query.dynasty = dynasty;
    const total = await Master.countDocuments(query);
    const masters = await Master.find(query)
      .select('-biography')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ masters, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取名家列表失败' });
  }
});

router.get('/dynasties', async (req, res) => {
  try {
    const dynasties = await Master.distinct('dynasty');
    res.json(dynasties);
  } catch (error) {
    res.status(500).json({ message: '获取朝代列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const master = await Master.findById(req.params.id);
    if (!master) return res.status(404).json({ message: '名家不存在' });
    res.json(master);
  } catch (error) {
    res.status(500).json({ message: '获取名家详情失败' });
  }
});

router.post('/', auth, adminAuth, validateMaster, async (req, res) => {
  try {
    const master = new Master(req.body);
    await master.save();
    res.status(201).json({ message: '添加成功', master });
  } catch (error) {
    res.status(500).json({ message: '添加失败', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, validateMaster, async (req, res) => {
  try {
    const master = await Master.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!master) return res.status(404).json({ message: '名家不存在' });
    res.json({ message: '更新成功', master });
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Master.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

module.exports = router;
