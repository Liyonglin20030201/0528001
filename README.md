# 中医药文化科普网站

基于 Vue 3 + Node.js (Express) + MongoDB 的中医药文化科普平台。

## 项目结构

```
├── server/                # 后端
│   ├── app.js            # 入口文件
│   ├── seed.js           # 数据库初始化脚本
│   ├── .env              # 环境变量配置
│   ├── models/           # 数据模型
│   │   ├── User.js       # 用户模型
│   │   ├── Herb.js       # 药材模型
│   │   ├── Article.js    # 文章模型
│   │   └── Master.js     # 名家模型
│   ├── routes/           # 路由
│   │   ├── user.js       # 用户相关接口
│   │   ├── herb.js       # 药材相关接口
│   │   ├── article.js    # 文章相关接口
│   │   ├── master.js     # 名家相关接口
│   │   └── upload.js     # 文件上传接口
│   ├── middleware/       # 中间件
│   │   └── auth.js       # JWT 认证 & 管理员权限
│   └── uploads/          # 上传文件目录
├── client/                # 前端
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js       # 入口
│       ├── App.vue       # 根组件
│       ├── router/       # 路由配置
│       ├── stores/       # Pinia 状态管理
│       ├── utils/        # 工具（axios 封装）
│       ├── styles/       # 全局样式
│       └── views/        # 页面组件
│           ├── Home.vue
│           ├── Login.vue
│           ├── Register.vue
│           ├── Herbs.vue
│           ├── HerbDetail.vue
│           ├── Articles.vue
│           ├── ArticleDetail.vue
│           ├── Masters.vue
│           ├── MasterDetail.vue
│           ├── Favorites.vue
│           └── admin/    # 后台管理
│               ├── Dashboard.vue
│               ├── ArticleManage.vue
│               ├── HerbManage.vue
│               └── MasterManage.vue
└── README.md
```

## 功能模块

### 1. 用户模块
- 用户注册（用户名 + 邮箱 + 密码）
- 用户登录（JWT 令牌认证，有效期 7 天）
- 文章收藏 / 取消收藏
- 我的收藏列表

### 2. 药材展示模块
- 按分类浏览（解表药、清热药、补虚药等 15 类）
- 关键词搜索（名称 / 功效）
- 药材详情（性味、归经、功效、用法、禁忌）
- 分页展示

### 3. 养生文章模块
- 按季节分类（春 / 夏 / 秋 / 冬）
- 按体质分类（气虚 / 阳虚 / 阴虚 / 痰湿 / 血瘀）
- 关键词搜索
- 文章阅读量统计
- 文章收藏功能

### 4. 名家故事模块
- 按朝代筛选
- 名家详情（生平、贡献、故事、著作）
- 分页展示

### 5. 后台管理模块（仅管理员可访问）
- 文章发布 / 编辑 / 删除
- 药材添加 / 编辑 / 删除
- 名家添加 / 编辑 / 删除

## 数据库设计

### User（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| username | String | 用户名（唯一，3-20字符） |
| password | String | 密码（bcrypt 加密） |
| email | String | 邮箱（唯一） |
| role | String | 角色（user / admin） |
| favorites | ObjectId[] | 收藏的文章 ID 列表 |
| createdAt | Date | 注册时间 |

### Herb（药材表）
| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 药材名称 |
| alias | String | 别名 |
| category | String | 分类（15种分类之一） |
| nature | String | 性（温、寒、平等） |
| taste | String | 味（甘、苦、辛等） |
| meridian | String | 归经 |
| effect | String | 功效 |
| usage | String | 用法用量 |
| caution | String | 使用禁忌 |
| image | String | 图片路径 |

### Article（文章表）
| 字段 | 类型 | 说明 |
|------|------|------|
| title | String | 标题 |
| content | String | 内容 |
| summary | String | 摘要 |
| category | String | 分类（四季 / 体质） |
| coverImage | String | 封面图 |
| author | ObjectId | 作者 |
| viewCount | Number | 阅读量 |
| isPublished | Boolean | 是否发布 |

### Master（名家表）
| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 姓名 |
| dynasty | String | 朝代 |
| portrait | String | 画像 |
| biography | String | 生平简介 |
| contribution | String | 主要贡献 |
| stories | String[] | 经典故事 |
| famousWorks | String[] | 代表著作 |

## 环境要求

- Node.js >= 16
- MongoDB >= 5.0
- npm >= 8

## 安装与运行

### 1. 安装 MongoDB

下载并安装 MongoDB Community Server：https://www.mongodb.com/try/download/community

确保 MongoDB 服务已启动：
```bash
# Windows：MongoDB 通常作为服务自动运行
# 或手动启动
mongod --dbpath "C:\data\db"
```

### 2. 启动后端

```bash
cd server
npm install
node seed.js        # 初始化数据库（导入示例数据）
npm run dev         # 开发模式启动（需要 nodemon）
# 或
npm start           # 生产模式启动
```

后端启动后运行在 http://localhost:3000

### 3. 启动前端

```bash
cd client
npm install
npm run dev
```

前端启动后运行在 http://localhost:5173

### 4. 访问网站

打开浏览器访问 http://localhost:5173

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | testuser | test123 |

## API 接口一览

### 用户接口
- `POST /api/user/register` - 注册
- `POST /api/user/login` - 登录
- `GET /api/user/profile` - 获取个人信息（需登录）
- `POST /api/user/favorite/:articleId` - 收藏/取消收藏（需登录）
- `GET /api/user/favorites` - 获取收藏列表（需登录）

### 药材接口
- `GET /api/herbs` - 获取药材列表（支持 category、keyword、page、limit 参数）
- `GET /api/herbs/categories` - 获取所有分类
- `GET /api/herbs/:id` - 获取药材详情
- `POST /api/herbs` - 添加药材（管理员）
- `PUT /api/herbs/:id` - 编辑药材（管理员）
- `DELETE /api/herbs/:id` - 删除药材（管理员）

### 文章接口
- `GET /api/articles` - 获取文章列表（支持 category、keyword、page、limit 参数）
- `GET /api/articles/:id` - 获取文章详情（自动增加阅读量）
- `POST /api/articles` - 发布文章（管理员）
- `PUT /api/articles/:id` - 编辑文章（管理员）
- `DELETE /api/articles/:id` - 删除文章（管理员）

### 名家接口
- `GET /api/masters` - 获取名家列表（支持 dynasty、page、limit 参数）
- `GET /api/masters/dynasties` - 获取所有朝代
- `GET /api/masters/:id` - 获取名家详情
- `POST /api/masters` - 添加名家（管理员）
- `PUT /api/masters/:id` - 编辑名家（管理员）
- `DELETE /api/masters/:id` - 删除名家（管理员）

### 上传接口
- `POST /api/upload` - 上传图片（管理员，支持 jpg/png/gif/webp，最大 5MB）

## 技术栈

- **前端**：Vue 3 + Vue Router + Pinia + Axios + Vite
- **后端**：Node.js + Express + Mongoose + JWT + Multer
- **数据库**：MongoDB
- **认证**：JWT (JSON Web Token)
- **密码加密**：bcryptjs
