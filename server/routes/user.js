const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    const user = new User({ username, password, email });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: '登录成功',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('favorites');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

router.post('/favorite/:articleId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const articleId = req.params.articleId;
    const index = user.favorites.indexOf(articleId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: '已取消收藏', isFavorited: false });
    } else {
      user.favorites.push(articleId);
      await user.save();
      res.json({ message: '收藏成功', isFavorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: '获取收藏列表失败' });
  }
});

router.put('/certify-expert/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { title, hospital, specialty, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        role: 'expert',
        expertInfo: {
          title: title || '',
          hospital: hospital || '',
          specialty: specialty || '',
          bio: bio || '',
          certifiedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '已认证为专家', user });
  } catch (error) {
    res.status(500).json({ message: '认证失败' });
  }
});

router.put('/revoke-expert/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '已撤销专家资格', user });
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

router.get('/experts', async (req, res) => {
  try {
    const experts = await User.find({ role: 'expert' }).select('username expertInfo createdAt');
    res.json(experts);
  } catch (error) {
    res.status(500).json({ message: '获取专家列表失败' });
  }
});

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const { keyword } = req.query;
    const query = {};
    if (keyword) {
      query.username = { $regex: keyword, $options: 'i' };
    }
    const users = await User.find(query).select('username email role expertInfo createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

module.exports = router;
