const express = require('express');
const Prescription = require('../models/Prescription');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, keyword, herb, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (herb) query['composition.herb'] = new RegExp(herb, 'i');
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { effect: new RegExp(keyword, 'i') },
        { indication: new RegExp(keyword, 'i') },
        { 'composition.herb': new RegExp(keyword, 'i') }
      ];
    }
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });
    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取方剂列表失败' });
  }
});

router.get('/categories', (req, res) => {
  res.json(['解表剂', '泻下剂', '和解剂', '清热剂', '温里剂', '补益剂', '固涩剂', '安神剂', '理气剂', '理血剂', '治风剂', '治燥剂', '祛湿剂', '祛痰剂', '消食剂', '驱虫剂']);
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: '方剂不存在' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: '获取方剂详情失败' });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json({ message: '添加成功', prescription });
  } catch (error) {
    res.status(500).json({ message: '添加方剂失败', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prescription) return res.status(404).json({ message: '方剂不存在' });
    res.json({ message: '更新成功', prescription });
  } catch (error) {
    res.status(500).json({ message: '更新失败' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

module.exports = router;
