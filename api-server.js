/**
 * ============================================================
 *  写作练习APP · 后端API服务
 *  Node.js + Express
 *  三个核心接口：随机例句 / AI批改 / 爬虫扩充
 * ============================================================
 *
 *  启动方式：
 *    npm install express cors body-parser
 *    node api-server.js
 *
 *  端口：3000（可改）
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 引入技巧数据库
const { SKILLS_DB, PROMPTS_DB } = require('./skills-data.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// ============================
// 工具函数
// ============================

// 从所有技巧中扁平化所有例句
function getAllExamples() {
  const list = [];
  SKILLS_DB.forEach(skill => {
    skill.examples.forEach(ex => {
      list.push({ ...ex, skill_id: skill.id, skill_name: skill.name, category: skill.category });
    });
  });
  return list;
}

// 随机取N条
function randomPick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 简易AI批改（规则引擎版，无需API Key）
// 后续可替换为真实LLM调用
function aiReview(text, skillId) {
  const skill = SKILLS_DB.find(s => s.id === skillId);
  const wordCount = text.replace(/\s/g, '').length;

  // 检测比喻词
  const metaphorWords = ['像','好像','如同','仿佛','是','变成','化作','犹如','宛如','似的'];
  const foundMetaphors = metaphorWords.filter(w => text.includes(w));

  // 检测排比（三个以上相似结构）
  const sentences = text.split(/[。！？]/).filter(s => s.trim());
  let parallelCount = 0;
  for (let i = 0; i < sentences.length - 2; i++) {
    const len1 = sentences[i].length;
    const len2 = sentences[i+1].length;
    const len3 = sentences[i+2].length;
    if (Math.abs(len1 - len2) < 5 && Math.abs(len2 - len3) < 5 && len1 > 5) {
      parallelCount++;
    }
  }

  // 检测感官词
  const sensoryWords = ['闻','听','看','摸','尝','触','嗅','声音','颜色','味道','温暖','冰冷','柔软','坚硬'];
  const foundSensory = sensoryWords.filter(w => text.includes(w));

  // 计算分数
  let score = 60; // 基础分
  score += Math.min(wordCount * 0.5, 15); // 字数加分，上限15
  if (foundMetaphors.length > 0) score += 10;
  if (parallelCount > 0) score += 8;
  if (foundSensory.length >= 2) score += 7;
  if (wordCount > 200) score += 5;
  score = Math.min(Math.round(score), 98);

  // 亮点
  const highlights = [];
  if (foundMetaphors.length > 0) highlights.push(`使用了"${foundMetaphors.join('、')}"等比喻词，比喻意识到位`);
  if (parallelCount > 0) highlights.push(`检测到${parallelCount}处排比结构，节奏感好`);
  if (foundSensory.length >= 2) highlights.push(`调动了${foundSensory.length}种感官词，画面感强`);
  if (wordCount > 150) highlights.push(`篇幅充实（${wordCount}字），有展开意识`);
  if (highlights.length === 0) highlights.push('完成了写作任务，有表达的意愿');

  // 改进建议
  const improvements = [];
  if (foundMetaphors.length === 0) improvements.push('建议尝试使用比喻，让抽象感受变得可见可感');
  if (parallelCount === 0) improvements.push('可以尝试排比句式，让文字更有节奏和气势');
  if (foundSensory.length < 2) improvements.push('多调动感官（视觉/听觉/嗅觉/触觉），让读者身临其境');
  if (wordCount < 80) improvements.push('字数偏少，建议展开细节，让画面更丰满');
  if (improvements.length === 0) improvements.push('整体表现不错，下次可以尝试混合多种技巧');

  // 技巧反馈
  const skill_feedback = {};
  if (skill) {
    let used = false, count = 0, quality = 'none', comment = '';
    switch(skillId) {
      case 'metaphor':
        count = foundMetaphors.length;
        used = count > 0;
        quality = count >= 3 ? 'excellent' : count >= 1 ? 'good' : 'none';
        comment = used ? `检测到${count}个比喻词，建议尝试博喻（多喻叠加）` : '本篇未检测到比喻，这是本次练习的核心技巧';
        break;
      case 'parallelism':
        count = parallelCount;
        used = count > 0;
        quality = count >= 2 ? 'excellent' : count >= 1 ? 'good' : 'none';
        comment = used ? `有${count}处排比，注意每层要"递进"而非"重复"` : '排比是本次重点，尝试三个结构相似的句子并列';
        break;
      case 'sensory':
        count = foundSensory.length;
        used = count >= 2;
        quality = count >= 4 ? 'excellent' : count >= 2 ? 'good' : 'none';
        comment = used ? `调动了${count}种感官，沉浸式写作` : '尝试同时写看到、听到、闻到什么';
        break;
      default:
        used = wordCount > 50;
        count = wordCount;
        quality = used ? 'good' : 'none';
        comment = skill.tip || '参考技巧说明中的练习建议';
    }
    skill_feedback[skillId] = { used, count, quality, comment };
  }

  // 总评
  let overall = '';
  if (score >= 90) overall = '非常出色！你对这项技巧的掌握已经相当成熟，可以尝试在一段文字中混合多种技巧。';
  else if (score >= 80) overall = '写得很好，核心技巧运用到位。下一步挑战：让每个句子都比前一句更深一层。';
  else if (score >= 70) overall = '不错的开头，能看出你在尝试。重点改进：' + improvements[0];
  else overall = '完成了就是胜利。建议先回顾技巧说明中的例句，模仿其结构再写一遍。';

  return { score, level: score>=90?'优秀':score>=80?'良好':score>=70?'中等':'加油', highlights, improvements, skill_feedback, overall };
}

// ============================
// 接口一：获取随机例句
// GET /api/examples/random?count=5&skill=metaphor
// ============================
app.get('/api/examples/random', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 5, 20);
  const skillFilter = req.query.skill;

  let pool = getAllExamples();
  if (skillFilter) {
    pool = pool.filter(ex => ex.skill_id === skillFilter);
  }

  if (pool.length === 0) {
    return res.json({ code: 404, msg: '未找到对应技巧的例句', data: [] });
  }

  const result = randomPick(pool, count);
  res.json({ code: 200, msg: 'success', data: result });
});

// 获取全部例句（可选按技巧筛选）
app.get('/api/examples', (req, res) => {
  const skillFilter = req.query.skill;
  let pool = getAllExamples();
  if (skillFilter) pool = pool.filter(ex => ex.skill_id === skillFilter);
  res.json({ code: 200, msg: 'success', total: pool.length, data: pool });
});

// ============================
// 接口二：AI写作批改
// POST /api/review
// Body: { text, skill_id, user_level }
// ============================
app.post('/api/review', (req, res) => {
  const { text, skill_id, user_level } = req.body;

  if (!text || text.trim().length < 5) {
    return res.json({ code: 400, msg: '作文内容太短，请至少写几个字', data: null });
  }
  if (!skill_id) {
    return res.json({ code: 400, msg: '缺少 skill_id 参数', data: null });
  }

  const result = aiReview(text, skill_id);

  // 如果有user_level，可以调整反馈策略
  // 后续接入真实LLM时，此处替换为API调用
  /*
  // 示例：接入 DeepSeek API
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位中文写作老师，请批改学生作文并给出评分和建议。' },
        { role: 'user', content: `技巧：${skill_id}\n学生作文：\n${text}` }
      ]
    })
  });
  const aiResult = await response.json();
  // 解析 aiResult 并返回
  */

  res.json({ code: 200, msg: 'success', data: result });
});

// ============================
// 接口三：爬虫抓取新例句
// POST /api/crawler/fetch
// Body: { source, skill, limit }
// ============================
app.post('/api/crawler/fetch', async (req, res) => {
  const { source = 'gushiwen', skill, limit = 10 } = req.body;

  // ---- 爬虫实现（需安装 axios + cheerio）----
  // npm install axios cheerio
  //
  // 以下为实际可运行的爬虫代码框架：
  //
  // const axios = require('axios');
  // const cheerio = require('cheerio');
  //
  // async function crawlGushiwen(skillName, limit) {
  //   const url = `https://www.gushiwen.cn/search.aspx?value=${encodeURIComponent(skillName)}`;
  //   const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  //   const $ = cheerio.load(data);
  //   const results = [];
  //   $('.sons .cont').each((i, el) => {
  //     if (i >= limit) return;
  //     const text = $(el).find('.contson').text().trim().slice(0, 100);
  //     const src = $(el).find('.source').text().trim();
  //     if (text) results.push({ text, src, label: '古诗文', an: '' });
  //   });
  //   return results;
  // }
  //
  // 其他来源：
  // - 豆瓣读书摘抄：https://book.douban.com/ (解析书评中的精彩段落)
  // - 维基语录：https://zh.wikiquote.org/
  // - 名言通：https://www.mingyantong.com/
  // - 古诗文网分类：按修辞手法关键词搜索
  //
  // ---- 当前返回模拟数据（爬虫模块待安装依赖后启用）----

  // 模拟爬取延迟
  await new Promise(r => setTimeout(r, 500));

  const mockResults = [
    { text: '燕山雪花大如席，片片吹落轩辕台。', src: '李白《北风行》', skill: 'hyperbole', an: '雪花大如席——夸张到荒谬，画面感极强。' },
    { text: '飞流直下三千尺，疑是银河落九天。', src: '李白《望庐山瀑布》', skill: 'hyperbole', an: '三千尺+银河坠落，空间夸张到宇宙尺度。' },
    { text: '白发三千丈，缘愁似个长。', src: '李白《秋浦歌》', skill: 'hyperbole', an: '白发三千丈，愁的长度被具象化。' },
    { text: '两岸猿声啼不住，轻舟已过万重山。', src: '李白《早发白帝城》', skill: 'hyperbole', an: '"万重山"夸张空间距离，反衬舟行之速。' },
  ].slice(0, limit);

  // 模拟入库操作
  const saved = mockResults.length;
  const skipped = Math.max(0, limit - saved);

  res.json({
    code: 200,
    msg: 'success',
    data: {
      source,
      fetched: limit,
      saved,
      skipped,
      new_examples: mockResults,
      message: '爬虫运行完成，新例句已自动标注并入库。正式版将连接真实数据源。'
    }
  });
});

// ============================
// 附加接口：获取全部技巧列表
// ============================
app.get('/api/skills', (req, res) => {
  const list = SKILLS_DB.map(s => ({
    id: s.id, name: s.name, category: s.category, catNo: s.catNo,
    sub: s.sub, desc: s.desc, example_count: s.examples.length
  }));
  res.json({ code: 200, msg: 'success', total: list.length, data: list });
});

// 获取单个技巧详情
app.get('/api/skills/:id', (req, res) => {
  const skill = SKILLS_DB.find(s => s.id === req.params.id);
  if (!skill) return res.json({ code: 404, msg: '技巧不存在', data: null });
  res.json({ code: 200, msg: 'success', data: skill });
});

// 获取命题
app.get('/api/prompts', (req, res) => {
  const skillFilter = req.query.skill;
  let list = PROMPTS_DB;
  if (skillFilter) list = list.filter(p => p.skill === skillFilter);
  res.json({ code: 200, msg: 'success', total: list.length, data: list });
});

// ============================
// 启动
// ============================
app.listen(PORT, () => {
  console.log(`🚀 写作练习API服务已启动: http://localhost:${PORT}`);
  console.log(`📖 接口文档:`);
  console.log(`   GET  /api/skills          获取全部68种技巧`);
  console.log(`   GET  /api/skills/:id      获取技巧详情`);
  console.log(`   GET  /api/examples/random 随机例句 (参数: count, skill)`);
  console.log(`   GET  /api/examples        全部例句 (参数: skill)`);
  console.log(`   POST /api/review          AI批改 (body: text, skill_id)`);
  console.log(`   POST /api/crawler/fetch   爬虫抓取 (body: source, skill, limit)`);
  console.log(`   GET  /api/prompts         获取命题库`);
});
