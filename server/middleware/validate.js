const validateRegister = (req, res, next) => {
  const { username, password, email } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3 || username.trim().length > 20) {
    errors.push('用户名长度需在3-20个字符之间');
  }
  if (username && !/^[a-zA-Z0-9_一-龥]+$/.test(username.trim())) {
    errors.push('用户名只能包含字母、数字、下划线和中文');
  }
  if (!password || password.length < 6) {
    errors.push('密码长度至少6个字符');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ message: '请输入用户名' });
  }
  if (!password) {
    return res.status(400).json({ message: '请输入密码' });
  }
  next();
};

const validateArticle = (req, res, next) => {
  const { title, content, category } = req.body;
  const errors = [];
  const validCategories = ['spring', 'summer', 'autumn', 'winter', 'qi_deficiency', 'yang_deficiency', 'yin_deficiency', 'phlegm_dampness', 'blood_stasis', 'general'];

  if (!title || title.trim().length < 2 || title.trim().length > 100) {
    errors.push('标题长度需在2-100个字符之间');
  }
  if (!content || content.trim().length < 10) {
    errors.push('文章内容至少需要10个字符');
  }
  if (!category || !validCategories.includes(category)) {
    errors.push('请选择有效的文章分类');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
};

const validateHerb = (req, res, next) => {
  const { name, category, nature, taste, effect } = req.body;
  const errors = [];
  const validCategories = ['解表药', '清热药', '泻下药', '祛风湿药', '化湿药', '利水渗湿药', '温里药', '理气药', '消食药', '补虚药', '收涩药', '安神药', '活血化瘀药', '止血药', '化痰止咳平喘药'];

  if (!name || name.trim().length < 1 || name.trim().length > 30) {
    errors.push('药材名称不能为空且不超过30个字符');
  }
  if (!category || !validCategories.includes(category)) {
    errors.push('请选择有效的药材分类');
  }
  if (!nature || nature.trim().length < 1) {
    errors.push('请填写药性');
  }
  if (!taste || taste.trim().length < 1) {
    errors.push('请填写药味');
  }
  if (!effect || effect.trim().length < 2) {
    errors.push('请填写功效描述（至少2个字符）');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
};

const validateMaster = (req, res, next) => {
  const { name, dynasty, biography } = req.body;
  const errors = [];

  if (!name || name.trim().length < 1 || name.trim().length > 20) {
    errors.push('姓名不能为空且不超过20个字符');
  }
  if (!dynasty || dynasty.trim().length < 1 || dynasty.trim().length > 20) {
    errors.push('朝代不能为空且不超过20个字符');
  }
  if (!biography || biography.trim().length < 10) {
    errors.push('生平简介至少需要10个字符');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateArticle, validateHerb, validateMaster };
