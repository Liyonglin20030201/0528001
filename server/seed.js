require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Herb = require('./models/Herb');
const Article = require('./models/Article');
const Master = require('./models/Master');
const Prescription = require('./models/Prescription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcm_culture';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功，开始初始化数据...');

    await User.deleteMany({});
    await Herb.deleteMany({});
    await Article.deleteMany({});
    await Master.deleteMany({});
    await Prescription.deleteMany({});

    const admin = new User({
      username: 'admin',
      password: 'admin123',
      email: 'admin@tcm.com',
      role: 'admin'
    });
    await admin.save();
    console.log('管理员账号创建成功: admin / admin123');

    const testUser = new User({
      username: 'testuser',
      password: 'test123',
      email: 'test@tcm.com',
      role: 'user'
    });
    await testUser.save();
    console.log('测试用户创建成功: testuser / test123');

    const herbs = [
      { name: '人参', alias: '棒槌、山参', category: '补虚药', nature: '温', taste: '甘、微苦', meridian: '脾、肺、心、肾经', effect: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智', usage: '煎服，3-9克；挽救虚脱可用15-30克', caution: '不宜与藜芦同用，实证、热证忌服' },
      { name: '黄芪', alias: '绵芪、北芪', category: '补虚药', nature: '微温', taste: '甘', meridian: '脾、肺经', effect: '补气升阳，固表止汗，利水消肿，生津养血，行滞通痹，托毒排脓，敛疮生肌', usage: '煎服，9-30克', caution: '表实邪盛、气滞湿阻、食积内停者慎用' },
      { name: '当归', alias: '干归、秦归', category: '补虚药', nature: '温', taste: '甘、辛', meridian: '肝、心、脾经', effect: '补血活血，调经止痛，润肠通便', usage: '煎服，6-12克', caution: '湿盛中满、大便泄泻者慎用' },
      { name: '甘草', alias: '国老、甜草', category: '补虚药', nature: '平', taste: '甘', meridian: '心、肺、脾、胃经', effect: '补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药', usage: '煎服，2-10克', caution: '不宜与海藻、大戟、甘遂、芫花同用' },
      { name: '麻黄', alias: '龙沙、草麻黄', category: '解表药', nature: '温', taste: '辛、微苦', meridian: '肺、膀胱经', effect: '发汗散寒，宣肺平喘，利水消肿', usage: '煎服，2-9克', caution: '体虚自汗、盗汗及肺肾虚喘者慎用' },
      { name: '金银花', alias: '忍冬花、双花', category: '清热药', nature: '寒', taste: '甘', meridian: '肺、心、胃经', effect: '清热解毒，疏散风热', usage: '煎服，6-15克', caution: '脾胃虚寒及气虚疮疡脓清者慎用' },
      { name: '菊花', alias: '甘菊、杭菊', category: '解表药', nature: '微寒', taste: '甘、苦', meridian: '肺、肝经', effect: '疏散风热，平抑肝阳，清肝明目，清热解毒', usage: '煎服，5-9克', caution: '气虚胃寒者慎用' },
      { name: '枸杞子', alias: '枸杞、红耳坠', category: '补虚药', nature: '平', taste: '甘', meridian: '肝、肾经', effect: '滋补肝肾，益精明目', usage: '煎服，6-12克', caution: '外邪实热、脾虚有湿及泄泻者慎用' },
      { name: '三七', alias: '田七、金不换', category: '止血药', nature: '温', taste: '甘、微苦', meridian: '肝、胃经', effect: '散瘀止血，消肿定痛', usage: '研粉吞服，1-3克；煎服，3-9克', caution: '孕妇慎用' },
      { name: '陈皮', alias: '橘皮、广陈皮', category: '理气药', nature: '温', taste: '辛、苦', meridian: '脾、肺经', effect: '理气健脾，燥湿化痰', usage: '煎服，3-9克', caution: '气虚证、阴虚燥咳、吐血证慎用' },
      { name: '板蓝根', alias: '靛青根、蓝靛根', category: '清热药', nature: '寒', taste: '苦', meridian: '心、胃经', effect: '清热解毒，凉血利咽', usage: '煎服，9-15克', caution: '体虚而无实火热毒者忌服' },
      { name: '大黄', alias: '将军、川军', category: '泻下药', nature: '寒', taste: '苦', meridian: '脾、胃、大肠、肝、心包经', effect: '泻下攻积，清热泻火，凉血解毒，逐瘀通经', usage: '煎服，3-15克', caution: '孕妇及月经期、哺乳期慎用' }
    ];
    await Herb.insertMany(herbs);
    console.log(`${herbs.length} 种药材数据已导入`);

    const articles = [
      { title: '春季养生：疏肝理气正当时', content: '春季万物复苏，人体阳气开始升发。中医认为，春季养生应以疏肝理气为主。\n\n## 饮食调养\n\n春季宜食辛温升散之品，如韭菜、香菜、豆芽等。少食酸收之味，以免肝气过旺克脾。\n\n## 起居养生\n\n春天应"夜卧早起，广步于庭"。早睡早起，适当户外活动，让身体舒展。\n\n## 情志调摄\n\n春季应保持心情愉快，避免暴怒伤肝。可多听音乐、赏花踏青，使气血畅达。\n\n## 推荐茶饮\n\n菊花枸杞茶：菊花5朵，枸杞10粒，沸水冲泡，有疏肝明目之效。', summary: '春季养生要点：疏肝理气，饮食宜辛温，起居要规律，情志需舒畅', category: 'spring', author: admin._id },
      { title: '夏季养心：清热消暑保平安', content: '夏季炎热，心火旺盛，养生应以养心清热为主。\n\n## 饮食调养\n\n夏季宜食苦味食物以清心火，如苦瓜、莲子心等。多吃清淡、易消化食物，适当补充水分。\n\n## 起居养生\n\n夏季应"夜卧早起，无厌于日"。午休30分钟有助于养心安神。\n\n## 消暑良方\n\n绿豆汤、酸梅汤、西瓜翠衣水均为消暑佳品。但脾胃虚寒者不宜多饮冰冷之物。\n\n## 穴位保健\n\n常按内关穴（腕横纹上2寸）和劳宫穴（握拳时中指尖处），有宁心安神之效。', summary: '夏季养生要点：清心养神，饮食清淡，适当午休，避免贪凉', category: 'summer', author: admin._id },
      { title: '秋季润肺：滋阴防燥保健康', content: '秋季干燥，燥邪当令，最易伤肺。养生应以滋阴润肺为主。\n\n## 饮食调养\n\n秋季宜多食酸味收敛之品和滋阴润燥食物，如梨、银耳、百合、蜂蜜、芝麻等。少食辛辣发散之物。\n\n## 起居养生\n\n秋季应"早卧早起，与鸡俱兴"。注意添衣保暖，防止秋寒伤肺。\n\n## 润肺食疗\n\n冰糖雪梨：雪梨1个去核，填入冰糖和川贝粉，蒸40分钟。有润肺止咳化痰之效。\n\n## 注意事项\n\n秋季干燥易引发皮肤瘙痒和便秘，应多饮水，保持室内湿度。', summary: '秋季养生要点：滋阴润肺，饮食酸收，起居规律，预防秋燥', category: 'autumn', author: admin._id },
      { title: '冬季补肾：温阳藏精蓄能量', content: '冬季寒冷，万物闭藏，是进补的最佳时节。养生应以补肾温阳为主。\n\n## 饮食调养\n\n冬季宜食温热补益之品，如羊肉、牛肉、核桃、黑芝麻等。可适当进补膏方。\n\n## 起居养生\n\n冬季应"早卧晚起，必待日光"。注意保暖，尤其是头部、背部和足部。\n\n## 冬令进补\n\n当归生姜羊肉汤：当归15克，生姜30克，羊肉500克，炖煮2小时。有温中补血、散寒止痛之效。\n\n## 养肾方法\n\n常搓涌泉穴（脚底前1/3凹陷处），每次100下，可补肾强体。睡前热水泡脚，有助于温经通络。', summary: '冬季养生要点：补肾温阳，饮食温补，起居避寒，适当进补', category: 'winter', author: admin._id },
      { title: '气虚体质的调养方法', content: '气虚体质表现为容易疲乏、气短懒言、容易感冒。\n\n## 辨识特征\n\n- 说话声音低弱\n- 容易疲劳\n- 稍一活动就气喘\n- 容易出汗\n- 舌淡红，舌边有齿痕\n\n## 饮食调养\n\n宜食益气健脾之品：黄芪、党参、山药、大枣、莲子等。可常服黄芪大枣茶。\n\n## 运动建议\n\n宜柔缓运动，如太极拳、八段锦、散步。避免剧烈运动和大汗淋漓。\n\n## 推荐药膳\n\n四君子汤：党参9克，白术9克，茯苓9克，甘草6克，炖排骨或鸡肉。', summary: '气虚体质的特征识别和饮食运动调养建议', category: 'qi_deficiency', author: admin._id },
      { title: '阴虚体质的调养方法', content: '阴虚体质表现为手足心热、口燥咽干、容易失眠。\n\n## 辨识特征\n\n- 手足心热\n- 口燥咽干\n- 形体偏瘦\n- 面色潮红\n- 容易失眠多梦\n- 舌红少苔\n\n## 饮食调养\n\n宜食滋阴清热之品：百合、银耳、枸杞、桑葚、黑芝麻等。忌食辛辣燥热食物。\n\n## 起居建议\n\n避免熬夜，保证充足睡眠。居住环境宜安静凉爽。\n\n## 推荐药膳\n\n银耳百合汤：银耳15克，百合30克，冰糖适量，炖煮至软烂。有滋阴润肺之效。', summary: '阴虚体质的特征识别和滋阴调养方案', category: 'yin_deficiency', author: admin._id }
    ];
    await Article.insertMany(articles);
    console.log(`${articles.length} 篇文章已导入`);

    const masters = [
      { name: '扁鹊', dynasty: '春秋战国', biography: '扁鹊（公元前407年—前310年），姬姓，秦氏，名越人，字少师。春秋战国时期名医，被誉为"脉学之宗"。扁鹊善于运用望、闻、问、切四诊法诊断疾病，尤其精于望诊和切脉。他周游列国行医，留下了许多传奇故事。', contribution: '创立了中医"四诊法"（望闻问切），奠定了中医诊断学基础', stories: ['扁鹊见蔡桓公：通过望诊发现蔡桓公病情由浅入深，三次劝谏未果，最终病入骨髓不治而亡。此典故说明治病要及早。', '扁鹊换心术：为鲁公扈和赵齐婴二人互换心脏，体现了古代医者的大胆探索精神。'], famousWorks: ['《扁鹊内经》', '《扁鹊外经》'] },
      { name: '华佗', dynasty: '东汉', biography: '华佗（约145年—208年），字元化，沛国谯县（今安徽亳州）人。东汉末年著名医学家，与董奉、张仲景并称为"建安三神医"。华佗精通内、外、妇、儿各科，尤擅外科手术，被后人称为"外科圣手"。', contribution: '发明麻沸散（世界最早的全身麻醉药）、创编五禽戏（最早的医疗体操）', stories: ['刮骨疗毒：为关羽刮去骨上箭毒，关羽饮酒对弈面不改色，体现了医者精湛技艺和患者非凡勇气。', '开颅治病：华佗提出为曹操开颅治疗头风病，因曹操多疑被杀，留下千古遗憾。'], famousWorks: ['《青囊经》（已佚）'] },
      { name: '张仲景', dynasty: '东汉', biography: '张仲景（约150年—219年），名机，字仲景，南阳涅阳县（今河南邓州）人。东汉末年著名医学家，被后人尊称为"医圣"。他广泛收集医方，著成《伤寒杂病论》，确立了辨证论治的原则。', contribution: '创立辨证论治体系，奠定了中医临床医学基础', stories: ['坐堂行医：张仲景任长沙太守时，每月初一、十五在大堂上为百姓看病，"坐堂医生"之称由此而来。', '饺子传说：张仲景冬至舍药"祛寒娇耳汤"治冻疮，后人效仿包饺子纪念，形成冬至吃饺子的习俗。'], famousWorks: ['《伤寒杂病论》', '《金匮要略》'] },
      { name: '孙思邈', dynasty: '唐代', biography: '孙思邈（581年—682年），京兆华原（今陕西省铜川市耀州区）人。唐代著名医药学家，被后人尊称为"药王"。他一生致力于医学研究，享年101岁，著有《千金要方》《千金翼方》等医学巨著。', contribution: '编著《千金要方》《千金翼方》，系统总结唐以前医学成就，提出"大医精诚"的医德理念', stories: ['救龙传说：相传孙思邈曾救治一条受伤小蛇（龙），龙王赠予《龙宫药方》以报恩。', '大医精诚：孙思邈在《千金要方》开篇提出"大医精诚"的医德标准，强调医者应有精湛医术和高尚品德。'], famousWorks: ['《千金要方》', '《千金翼方》'] },
      { name: '李时珍', dynasty: '明代', biography: '李时珍（1518年—1593年），字东璧，号濒湖，湖北蕲春人。明代著名医药学家，被后人尊称为"药圣"。他历经27年编著《本草纲目》，收录药物1892种，附方11096个，是中国古代药学史上的伟大巨著。', contribution: '编著《本草纲目》，系统总结了16世纪以前中国药学成就，对世界医药学发展做出了重大贡献', stories: ['尝百草：李时珍为了验证药性，亲自品尝药物。尝曼陀罗花时中毒昏迷，醒后详细记录症状和解毒方法。', '三访蕲州：为编写《本草纲目》，李时珍三次远行考察，跋山涉水采集标本，历时27年完成巨著。'], famousWorks: ['《本草纲目》', '《濒湖脉学》', '《奇经八脉考》'] }
    ];
    await Master.insertMany(masters);
    console.log(`${masters.length} 位名家数据已导入`);

    const prescriptions = [
      { name: '麻黄汤', source: '《伤寒论》', category: '解表剂', composition: [{ herb: '麻黄', dosage: '9g' }, { herb: '桂枝', dosage: '6g' }, { herb: '杏仁', dosage: '6g' }, { herb: '甘草', dosage: '3g' }], method: '水煎服，温覆取微似汗', effect: '发汗解表，宣肺平喘', indication: '外感风寒表实证。恶寒发热，头身疼痛，无汗而喘，舌苔薄白，脉浮紧', analysis: '麻黄为君，发汗解表、宣肺平喘；桂枝为臣，助麻黄发汗解表；杏仁为佐，助麻黄平喘；甘草为使，调和诸药', caution: '体虚自汗者忌用' },
      { name: '桂枝汤', source: '《伤寒论》', category: '解表剂', composition: [{ herb: '桂枝', dosage: '9g' }, { herb: '芍药', dosage: '9g' }, { herb: '生姜', dosage: '9g' }, { herb: '大枣', dosage: '3枚' }, { herb: '甘草', dosage: '6g' }], method: '水煎服，服后啜粥，温覆取汗', effect: '解肌发表，调和营卫', indication: '外感风寒表虚证。发热头痛，汗出恶风，鼻鸣干呕，苔白不渴，脉浮缓或浮弱', analysis: '桂枝为君，解肌发表、温通经脉；芍药为臣，益阴敛营；生姜、大枣为佐，调和脾胃；甘草为使，调和诸药', caution: '表实无汗者不宜' },
      { name: '四君子汤', source: '《太平惠民和剂局方》', category: '补益剂', composition: [{ herb: '人参', dosage: '9g' }, { herb: '白术', dosage: '9g' }, { herb: '茯苓', dosage: '9g' }, { herb: '甘草', dosage: '6g' }], method: '水煎服', effect: '益气健脾', indication: '脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱', analysis: '人参为君，大补元气、健脾养胃；白术为臣，健脾燥湿；茯苓为佐，健脾渗湿；甘草为使，益气和中、调和诸药', caution: '阴虚内热者慎用' },
      { name: '四物汤', source: '《太平惠民和剂局方》', category: '补益剂', composition: [{ herb: '当归', dosage: '12g' }, { herb: '川芎', dosage: '9g' }, { herb: '白芍', dosage: '12g' }, { herb: '熟地黄', dosage: '12g' }], method: '水煎服', effect: '补血调经', indication: '营血虚滞证。心悸失眠，头晕目眩，面色无华，妇人月经不调，量少或经闭不行，脐腹作痛，舌淡，脉细弦或细涩', analysis: '熟地黄为君，滋阴养血填精；当归为臣，补血活血调经；白芍为佐，养血柔肝；川芎为使，活血行气', caution: '脾虚食少便溏者慎用' },
      { name: '六味地黄丸', source: '《小儿药证直诀》', category: '补益剂', composition: [{ herb: '熟地黄', dosage: '24g' }, { herb: '山茱萸', dosage: '12g' }, { herb: '山药', dosage: '12g' }, { herb: '泽泻', dosage: '9g' }, { herb: '牡丹皮', dosage: '9g' }, { herb: '茯苓', dosage: '9g' }], method: '研末蜜丸，每次9g，每日2次', effect: '滋阴补肾', indication: '肾阴虚证。腰膝酸软，头晕目眩，耳鸣耳聋，盗汗遗精，骨蒸潮热，手足心热，舌红少苔，脉细数', analysis: '熟地黄为君，滋阴补肾填精；山茱萸、山药为臣，补肝脾以助肾；泽泻、牡丹皮、茯苓为佐使，泻三脏之浊', caution: '脾虚泄泻者慎用' },
      { name: '补中益气汤', source: '《脾胃论》', category: '补益剂', composition: [{ herb: '黄芪', dosage: '18g' }, { herb: '甘草', dosage: '9g' }, { herb: '人参', dosage: '6g' }, { herb: '当归', dosage: '3g' }, { herb: '陈皮', dosage: '6g' }, { herb: '升麻', dosage: '6g' }, { herb: '柴胡', dosage: '6g' }, { herb: '白术', dosage: '9g' }], method: '水煎服', effect: '补中益气，升阳举陷', indication: '脾虚气陷证。饮食减少，体倦肢软，少气懒言，面色萎黄，大便稀溏，脉虚；及脱肛、子宫脱垂、久泻久痢等', analysis: '黄芪为君，补中益气、升阳固表；人参、白术、甘草为臣，益气健脾；当归养血，陈皮理气为佐；升麻、柴胡升举清阳为使', caution: '阴虚发热者忌用' },
      { name: '逍遥散', source: '《太平惠民和剂局方》', category: '和解剂', composition: [{ herb: '柴胡', dosage: '9g' }, { herb: '当归', dosage: '9g' }, { herb: '白芍', dosage: '9g' }, { herb: '白术', dosage: '9g' }, { herb: '茯苓', dosage: '9g' }, { herb: '甘草', dosage: '6g' }, { herb: '薄荷', dosage: '3g' }, { herb: '生姜', dosage: '3g' }], method: '水煎服', effect: '疏肝解郁，养血健脾', indication: '肝郁血虚脾弱证。两胁作痛，头痛目眩，口燥咽干，神疲食少，或月经不调，乳房胀痛，脉弦而虚', analysis: '柴胡为君，疏肝解郁；当归、白芍为臣，养血柔肝；白术、茯苓为佐，健脾祛湿；甘草为使，调和诸药；薄荷助柴胡疏肝；生姜温胃和中', caution: '阴虚血热者慎用' },
      { name: '小柴胡汤', source: '《伤寒论》', category: '和解剂', composition: [{ herb: '柴胡', dosage: '24g' }, { herb: '黄芩', dosage: '9g' }, { herb: '人参', dosage: '6g' }, { herb: '半夏', dosage: '9g' }, { herb: '甘草', dosage: '6g' }, { herb: '生姜', dosage: '9g' }, { herb: '大枣', dosage: '4枚' }], method: '水煎服', effect: '和解少阳', indication: '伤寒少阳证。往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕，口苦，咽干，目眩，舌苔薄白，脉弦', analysis: '柴胡为君，疏邪透表、疏泄气机；黄芩为臣，清少阳之热；半夏、生姜为佐，和胃降逆止呕；人参、大枣为佐，益气健脾扶正；甘草为使，调和诸药', caution: '阴虚血少者慎用' },
      { name: '银翘散', source: '《温病条辨》', category: '解表剂', composition: [{ herb: '金银花', dosage: '15g' }, { herb: '连翘', dosage: '15g' }, { herb: '薄荷', dosage: '6g' }, { herb: '荆芥穗', dosage: '6g' }, { herb: '淡豆豉', dosage: '5g' }, { herb: '牛蒡子', dosage: '6g' }, { herb: '桔梗', dosage: '6g' }, { herb: '竹叶', dosage: '4g' }, { herb: '甘草', dosage: '5g' }, { herb: '芦根', dosage: '30g' }], method: '水煎服，香气大出即取服，不可久煎', effect: '辛凉透表，清热解毒', indication: '温病初起。发热无汗或有汗不畅，微恶风寒，头痛口渴，咳嗽咽痛，舌尖红，苔薄白或薄黄，脉浮数', analysis: '金银花、连翘为君，清热解毒、辛凉透表；薄荷、荆芥穗、淡豆豉为臣，辛散表邪；桔梗、牛蒡子为佐，宣肺利咽；竹叶、芦根为佐，清热生津；甘草为使，调和诸药', caution: '风寒表证忌用' },
      { name: '龙胆泻肝汤', source: '《医方集解》', category: '清热剂', composition: [{ herb: '龙胆草', dosage: '6g' }, { herb: '黄芩', dosage: '9g' }, { herb: '栀子', dosage: '9g' }, { herb: '泽泻', dosage: '12g' }, { herb: '木通', dosage: '6g' }, { herb: '车前子', dosage: '9g' }, { herb: '当归', dosage: '3g' }, { herb: '生地黄', dosage: '9g' }, { herb: '柴胡', dosage: '6g' }, { herb: '甘草', dosage: '6g' }], method: '水煎服', effect: '清泻肝胆实火，清利肝经湿热', indication: '肝胆实火上炎证或肝经湿热下注证。头痛目赤，胁痛口苦，耳聋耳肿；或阴肿阴痒，筋痿阴汗，小便淋浊，妇女带下黄臭', analysis: '龙胆草为君，泻肝胆实火、清下焦湿热；黄芩、栀子为臣，清热燥湿泻火；泽泻、木通、车前子为佐，利湿清热；当归、生地黄为佐，养血滋阴；柴胡为引经使药；甘草为使，调和诸药', caution: '脾胃虚寒者忌用' },
      { name: '归脾汤', source: '《济生方》', category: '补益剂', composition: [{ herb: '白术', dosage: '9g' }, { herb: '茯苓', dosage: '9g' }, { herb: '黄芪', dosage: '12g' }, { herb: '龙眼肉', dosage: '12g' }, { herb: '酸枣仁', dosage: '12g' }, { herb: '人参', dosage: '6g' }, { herb: '木香', dosage: '6g' }, { herb: '甘草', dosage: '3g' }, { herb: '当归', dosage: '9g' }, { herb: '远志', dosage: '6g' }], method: '水煎服', effect: '益气补血，健脾养心', indication: '心脾气血两虚证。心悸怔忡，健忘失眠，盗汗虚热，体倦食少，面色萎黄，舌淡苔薄白，脉细弱；脾不统血证', analysis: '黄芪、人参、白术、甘草为君臣，益气补脾；当归、龙眼肉为臣，补血养心；酸枣仁、远志为佐，宁心安神；茯苓为佐，健脾宁心；木香为使，理气醒脾', caution: '外感发热者忌用' },
      { name: '血府逐瘀汤', source: '《医林改错》', category: '理血剂', composition: [{ herb: '桃仁', dosage: '12g' }, { herb: '红花', dosage: '9g' }, { herb: '当归', dosage: '9g' }, { herb: '生地黄', dosage: '9g' }, { herb: '川芎', dosage: '5g' }, { herb: '赤芍', dosage: '6g' }, { herb: '牛膝', dosage: '9g' }, { herb: '桔梗', dosage: '5g' }, { herb: '柴胡', dosage: '3g' }, { herb: '枳壳', dosage: '6g' }, { herb: '甘草', dosage: '3g' }], method: '水煎服', effect: '活血化瘀，行气止痛', indication: '胸中血瘀证。胸痛头痛，日久不愈，痛如针刺而有定处，或呃逆日久不止，或内热瞀闷，或心悸怔忡失眠多梦，急躁易怒，入暮潮热，唇暗或两目暗黑，舌暗红或有瘀斑瘀点，脉涩或弦紧', analysis: '桃仁、红花为君，活血化瘀；川芎、赤芍为臣，助君活血祛瘀；当归、生地黄养血润燥，使祛瘀而不伤正；牛膝活血通经引血下行；桔梗、枳壳一升一降，宽胸行气；柴胡疏肝解郁；甘草调和诸药', caution: '孕妇忌用' }
    ];
    await Prescription.insertMany(prescriptions);
    console.log(`${prescriptions.length} 个经典方剂已导入`);

    console.log('\n数据初始化完成！');
    console.log('管理员账号: admin / admin123');
    console.log('测试用户: testuser / test123');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

seedData();
