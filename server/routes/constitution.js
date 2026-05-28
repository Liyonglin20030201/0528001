const express = require('express');
const ConstitutionResult = require('../models/Constitution');
const Article = require('../models/Article');
const Herb = require('../models/Herb');
const { auth } = require('../middleware/auth');

const router = express.Router();

const constitutionTypes = {
  balanced: { name: '平和质', description: '阴阳气血调和，体态适中，面色润泽', recommendations: { herbs: ['枸杞子', '大枣'], diet: '饮食均衡，不偏食', exercise: '各种运动均可' } },
  qi_deficiency: { name: '气虚质', description: '元气不足，疲乏、气短、自汗', recommendations: { herbs: ['黄芪', '人参', '党参', '山药'], diet: '宜食益气健脾之品，如黄芪炖鸡、山药粥', exercise: '太极拳、八段锦等柔缓运动' } },
  yang_deficiency: { name: '阳虚质', description: '阳气不足，畏寒怕冷、手足不温', recommendations: { herbs: ['肉桂', '附子', '干姜'], diet: '宜食温阳散寒之品，如当归生姜羊肉汤', exercise: '注意保暖，避免在阴冷环境运动' } },
  yin_deficiency: { name: '阴虚质', description: '阴液亏少，口燥咽干、手足心热', recommendations: { herbs: ['枸杞子', '百合', '麦冬', '银耳'], diet: '宜食滋阴清热之品，如银耳百合汤', exercise: '避免剧烈运动大量出汗' } },
  phlegm_dampness: { name: '痰湿质', description: '痰湿凝聚，体型肥胖、腹部肥满', recommendations: { herbs: ['陈皮', '茯苓', '薏苡仁'], diet: '饮食清淡，少食肥甘厚腻', exercise: '多做有氧运动，如快走、游泳' } },
  damp_heat: { name: '湿热质', description: '湿热内蕴，面垢油光、口苦口干', recommendations: { herbs: ['金银花', '菊花', '薏苡仁'], diet: '宜食清利化湿之品，忌辛辣油腻', exercise: '适合高强度运动，多排汗' } },
  blood_stasis: { name: '血瘀质', description: '血行不畅，肤色晦暗、易生斑点', recommendations: { herbs: ['三七', '当归', '丹参', '红花'], diet: '宜食活血化瘀之品，如山楂茶', exercise: '多做舒展运动，促进血液循环' } },
  qi_stagnation: { name: '气郁质', description: '气机郁滞，情绪低落、忧郁寡欢', recommendations: { herbs: ['玫瑰花', '佛手', '香附', '柴胡'], diet: '宜食行气解郁之品，如玫瑰花茶、佛手粥', exercise: '多参加群体运动，郊游踏青' } },
  special: { name: '特禀质', description: '先天特殊体质，易过敏', recommendations: { herbs: ['黄芪', '防风', '白术'], diet: '饮食清淡，避免已知过敏食物', exercise: '适度运动，避免过敏原环境' } }
};

const questions = [
  { id: 1, text: '您容易疲乏吗？', type: 'qi_deficiency' },
  { id: 2, text: '您容易气短（呼吸短促，接不上气）吗？', type: 'qi_deficiency' },
  { id: 3, text: '您容易心慌吗？', type: 'qi_deficiency' },
  { id: 4, text: '您容易头晕或站起时眼前发黑吗？', type: 'qi_deficiency' },
  { id: 5, text: '您比一般人耐受不了寒冷吗（冬天怕冷，夏天耐热）？', type: 'yang_deficiency' },
  { id: 6, text: '您手脚发凉吗？', type: 'yang_deficiency' },
  { id: 7, text: '您胃部、背部或腰膝部怕冷吗？', type: 'yang_deficiency' },
  { id: 8, text: '您吃（喝）凉的东西会感到不舒服或者怕吃凉的吗？', type: 'yang_deficiency' },
  { id: 9, text: '您感到手脚心发热吗？', type: 'yin_deficiency' },
  { id: 10, text: '您感觉身体、脸上发热吗？', type: 'yin_deficiency' },
  { id: 11, text: '您皮肤或口唇干燥吗？', type: 'yin_deficiency' },
  { id: 12, text: '您口唇的颜色比一般人红吗？', type: 'yin_deficiency' },
  { id: 13, text: '您感到眼睛干涩吗？', type: 'yin_deficiency' },
  { id: 14, text: '您腹部肥大吗？', type: 'phlegm_dampness' },
  { id: 15, text: '您额头部位油脂分泌多吗？', type: 'phlegm_dampness' },
  { id: 16, text: '您上眼睑比别人肿（上眼皮比别人厚）吗？', type: 'phlegm_dampness' },
  { id: 17, text: '您嘴里有黏黏的感觉吗？', type: 'phlegm_dampness' },
  { id: 18, text: '您面部或鼻部有油腻感或者油亮发光吗？', type: 'damp_heat' },
  { id: 19, text: '您容易生痤疮或者疮疖吗？', type: 'damp_heat' },
  { id: 20, text: '您感到口苦或嘴里有异味吗？', type: 'damp_heat' },
  { id: 21, text: '您大便黏滞不爽、有解不尽的感觉吗？', type: 'damp_heat' },
  { id: 22, text: '您皮肤在不知不觉中出现青紫瘀斑吗？', type: 'blood_stasis' },
  { id: 23, text: '您两颧部有细微红丝（毛细血管扩张）吗？', type: 'blood_stasis' },
  { id: 24, text: '您身体上有哪里疼痛吗？', type: 'blood_stasis' },
  { id: 25, text: '您面色晦暗或容易出现褐斑吗？', type: 'blood_stasis' },
  { id: 26, text: '您容易感到闷闷不乐、情绪低沉吗？', type: 'qi_stagnation' },
  { id: 27, text: '您容易精神紧张、焦虑不安吗？', type: 'qi_stagnation' },
  { id: 28, text: '您多愁善感、感情脆弱吗？', type: 'qi_stagnation' },
  { id: 29, text: '您容易感到害怕或受到惊吓吗？', type: 'qi_stagnation' },
  { id: 30, text: '您没有感冒时也会打喷嚏吗？', type: 'special' },
  { id: 31, text: '您没有感冒时也会鼻塞、流鼻涕吗？', type: 'special' },
  { id: 32, text: '您容易患过敏性鼻炎或哮喘吗？', type: 'special' },
  { id: 33, text: '您的皮肤容易起荨麻疹吗？', type: 'special' }
];

router.get('/questions', (req, res) => {
  res.json({ questions, types: constitutionTypes });
});

router.get('/types', (req, res) => {
  res.json(constitutionTypes);
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: '请完成所有题目' });
    }

    const scores = {};
    Object.keys(constitutionTypes).forEach(type => { scores[type] = 0; });

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && answer.score) {
        scores[question.type] = (scores[question.type] || 0) + answer.score;
      }
    });

    const maxQuestions = {};
    questions.forEach(q => {
      maxQuestions[q.type] = (maxQuestions[q.type] || 0) + 1;
    });

    const normalizedScores = Object.entries(scores).map(([type, score]) => ({
      type,
      score: Math.round((score / (maxQuestions[type] * 5)) * 100)
    }));

    normalizedScores.sort((a, b) => b.score - a.score);
    const primaryType = normalizedScores[0].score > 40 ? normalizedScores[0].type : 'balanced';

    const result = new ConstitutionResult({
      user: req.user._id,
      results: normalizedScores,
      primaryType
    });
    await result.save();

    const categoryMap = {
      qi_deficiency: 'qi_deficiency',
      yang_deficiency: 'yang_deficiency',
      yin_deficiency: 'yin_deficiency',
      phlegm_dampness: 'phlegm_dampness',
      blood_stasis: 'blood_stasis'
    };

    let recommendedArticles = [];
    if (categoryMap[primaryType]) {
      recommendedArticles = await Article.find({ category: categoryMap[primaryType], isPublished: true })
        .select('title summary category')
        .limit(5);
    }
    if (recommendedArticles.length === 0) {
      recommendedArticles = await Article.find({ isPublished: true })
        .select('title summary category')
        .sort({ viewCount: -1 })
        .limit(5);
    }

    const typeInfo = constitutionTypes[primaryType];
    const herbNames = typeInfo.recommendations.herbs;
    const recommendedHerbs = await Herb.find({ name: { $in: herbNames } })
      .select('name category nature taste effect');

    res.json({
      primaryType,
      typeInfo: constitutionTypes[primaryType],
      scores: normalizedScores,
      recommendedArticles,
      recommendedHerbs
    });
  } catch (error) {
    res.status(500).json({ message: '提交失败，请重试' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const results = await ConstitutionResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: '获取历史记录失败' });
  }
});

module.exports = router;
