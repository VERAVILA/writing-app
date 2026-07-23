# 写作练习APP — 后端API部署说明

## 文件结构

```
writing-app/
├── index.html          # 前端APP（浏览器直接打开）
├── skills-data.js      # 68种技巧数据库（226条例句）
├── api-server.js       # 后端API服务（Node.js + Express）
├── api-test.html       # API功能测试页（浏览器打开验证）
└── README.md           # 本文件
```

## 快速启动

```bash
# 1. 安装依赖
cd writing-app
npm install express cors body-parser

# 2. 启动服务
node api-server.js

# 3. 浏览器打开测试页
open api-test.html
```

服务默认运行在 `http://localhost:3000`

## 三个核心接口

### ① 获取随机例句
```
GET http://localhost:3000/api/examples/random?count=5&skill=metaphor
```
- `count`：返回条数（默认5，最大20）
- `skill`：技巧ID（可选，不填则全库随机）
- 返回：例句数组（含出处、赏析、所属技巧）

### ② AI写作批改
```
POST http://localhost:3000/api/review
Content-Type: application/json

{
  "text": "月光像银色的丝绸铺在湖面上...",
  "skill_id": "metaphor",
  "user_level": "beginner"
}
```
- `text`：用户作文内容（无字数限制）
- `skill_id`：本次练习的目标技巧
- 返回：评分(0-100)、亮点、改进建议、技巧运用分析、总评

### ③ 爬虫抓取新例句
```
POST http://localhost:3000/api/crawler/fetch
Content-Type: application/json

{
  "source": "gushiwen",
  "skill": "metaphor",
  "limit": 10
}
```
- `source`：数据源（gushiwen / douban / wikiquote）
- `skill`：目标技巧分类
- `limit`：抓取数量
- 返回：抓取结果 + 自动标注 + 入库状态

## 爬虫数据源说明

| 来源 | URL | 说明 |
|------|-----|------|
| 古诗文网 | https://www.gushiwen.cn | 古典诗词，按修辞手法关键词搜索 |
| 豆瓣读书 | https://book.douban.com | 现代文学摘抄 |
| 维基语录 | https://zh.wikiquote.org | 中外名言警句 |
| 名言通 | https://www.mingyantong.com | 分类名言库 |

> 自用不考虑版权，爬取后标注出处即可。

## 接入真实AI模型

`api-server.js` 中的 `aiReview()` 函数当前为**规则引擎版**（关键词检测+打分）。
如需接入真实LLM，取消注释代码中 DeepSeek API 部分，填入 API Key 即可：

```js
// 支持的模型：
// - DeepSeek：https://api.deepseek.com （推荐，中文写作强）
// - 文心一言：https://qianfan.baidubce.com
// - 通义千问：https://dashscope.aliyuncs.com
// - 腾讯混元：https://cloud.tencent.com/product/hunyuan
```

## 前端接入方式

`index.html` 中的练习提交函数改为：

```js
async function submitPractice(text, skillId) {
  const res = await fetch('http://localhost:3000/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, skill_id: skillId })
  });
  return await res.json();
}
```

## 部署到云端

| 平台 | 方案 | 费用 |
|------|------|------|
| 腾讯云轻量服务器 | Node.js 直接部署 | ¥50-100/月 |
| 腾讯云函数 SCF | Serverless，按调用计费 | 免费额度内0元 |
| 阿里云函数计算 | Serverless | 免费额度内0元 |
| Railway | 海外部署，GitHub一键连接 | 免费版可用 |

## 数据持久化（可选）

当前例句数据存在内存中（skills-data.js）。如需持久化：
- 轻量：用 SQLite（npm install better-sqlite3）
- 标准：用 MySQL / PostgreSQL
- 云：腾讯云数据库 / Supabase（免费）

## 确认清单

- [ ] 三个API接口测试通过
- [ ] AI批改返回合理评分
- [ ] 爬虫能抓到新例句
- [ ] 前端APP能正常调用API
- [ ] 选择部署平台
- [ ] 填入真实AI模型API Key（可选）
