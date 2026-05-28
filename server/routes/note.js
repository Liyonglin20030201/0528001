const express = require('express');
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const query = { user: req.user._id };
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { content: new RegExp(keyword, 'i') },
        { tags: new RegExp(keyword, 'i') }
      ];
    }
    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ notes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取笔记失败' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const query = { isPublic: true };
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { content: new RegExp(keyword, 'i') },
        { tags: new RegExp(keyword, 'i') }
      ];
    }
    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('user', 'username')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ notes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取笔记失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', 'username');
    if (!note) return res.status(404).json({ message: '笔记不存在' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: '获取笔记失败' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }
    const note = new Note({
      user: req.user._id,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      isPublic: isPublic || false
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: '创建笔记失败' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: '笔记不存在' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权编辑该笔记' });
    }
    const { title, content, tags, isPublic } = req.body;
    Object.assign(note, {
      title: title || note.title,
      content: content || note.content,
      tags: tags !== undefined ? tags : note.tags,
      isPublic: isPublic !== undefined ? isPublic : note.isPublic
    });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: '更新笔记失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: '笔记不存在' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权删除该笔记' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: '笔记不存在' });
    const userId = req.user._id.toString();
    const index = note.likes.findIndex(id => id.toString() === userId);
    if (index > -1) {
      note.likes.splice(index, 1);
    } else {
      note.likes.push(req.user._id);
    }
    await note.save();
    res.json({ likes: note.likes.length, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

module.exports = router;
