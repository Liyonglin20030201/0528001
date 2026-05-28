const express = require('express');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/article/:articleId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { article: req.params.articleId, parentComment: null };
    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const commentIds = comments.map(c => c._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate('user', 'username')
      .sort({ createdAt: 1 });

    const commentsWithReplies = comments.map(comment => ({
      ...comment.toObject(),
      replies: replies.filter(r => r.parentComment.toString() === comment._id.toString())
    }));

    res.json({ comments: commentsWithReplies, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: '获取评论失败' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { articleId, content, parentComment } = req.body;
    if (!articleId || !content || content.trim().length === 0) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }
    if (content.length > 500) {
      return res.status(400).json({ message: '评论内容不能超过500字' });
    }
    const comment = new Comment({
      article: articleId,
      user: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null
    });
    await comment.save();
    await comment.populate('user', 'username');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: '发表评论失败' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '评论不存在' });
    const userId = req.user._id.toString();
    const index = comment.likes.findIndex(id => id.toString() === userId);
    if (index > -1) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(req.user._id);
    }
    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '评论不存在' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除该评论' });
    }
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败' });
  }
});

module.exports = router;
