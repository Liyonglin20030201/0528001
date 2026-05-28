const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, keyword } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ];
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('user', 'username')
      .populate('answers.expert', 'username role expertInfo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      questions,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: '获取问题列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('user', 'username')
      .populate('answers.expert', 'username role expertInfo');

    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: '获取问题详情失败' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }

    const question = new Question({
      user: req.user._id,
      title,
      content,
      category: category || '其他',
      tags: tags || []
    });
    await question.save();
    await question.populate('user', 'username');

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: '提交问题失败' });
  }
});

router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: '回答内容不能为空' });
    }

    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      return res.status(403).json({ message: '只有认证专家才能回答问题' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    question.answers.push({
      expert: req.user._id,
      content
    });
    question.status = 'answered';
    await question.save();
    await question.populate('answers.expert', 'username role expertInfo');

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: '提交回答失败' });
  }
});

router.post('/:id/answer/:answerId/accept', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有提问者可以采纳答案' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: '回答不存在' });
    }

    question.answers.forEach(a => { a.isAccepted = false; });
    answer.isAccepted = true;
    question.status = 'closed';
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: '采纳失败' });
  }
});

router.post('/:id/answer/:answerId/like', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: '回答不存在' });
    }

    const likeIndex = answer.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      answer.likes.splice(likeIndex, 1);
    } else {
      answer.likes.push(req.user._id);
    }
    await question.save();

    res.json({ likes: answer.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

router.get('/my/questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id })
      .populate('answers.expert', 'username expertInfo')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: '获取我的问题失败' });
  }
});

module.exports = router;
