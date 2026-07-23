# 部署到 GitHub Pages（免费，永久链接）

## 步骤

### 1. 创建 GitHub 仓库
1. 登录 https://github.com
2. 点右上角 "+" → "New repository"
3. 仓库名建议：`writing-app`
4. 设为 **Public**（GitHub Pages 免费版需要公开仓库）
5. 不要勾选 "Add README"（我们已经有了）

### 2. 上传代码
有两种方式：

**方式A：用 Git 命令行（推荐）**
```bash
cd writing-app
git init
git add .
git commit -m "init: 写作练习APP"
git branch -M main
git remote add origin https://github.com/<你的用户名>/writing-app.git
git push -u origin main
```

**方式B：直接拖拽上传**
1. 在 GitHub 仓库页面点 "uploading an existing file"
2. 把 writing-app 文件夹里的所有文件拖进去
3. 点 "Commit changes"

### 3. 开启 GitHub Pages
1. 仓库页面 → **Settings** → 左侧 **Pages**
2. **Source** 选 **GitHub Actions**
3. 等待约 30 秒，Actions 标签页会显示部署进度
4. 绿色勾 ✅ 出现后，你的链接就生效了！

### 4. 访问链接
```
https://<你的用户名>.github.io/writing-app/writing-app-on-line.html
```

也可以把 `writing-app-on-line.html` 重命名为 `index.html`，这样直接访问：
```
https://<你的用户名>.github.io/writing-app/
```

## 效果
- ✅ 永久免费链接
- ✅ HTTPS 加密
- ✅ 手机浏览器直接打开
- ✅ 无需服务器维护
- ✅ 修改后自动部署（push 即更新）

## 注意事项
- 仓库必须设为 Public
- 第一次部署需要等 1-2 分钟
- 如果改了代码，push 后自动重新部署
- 免费额度：每月 100GB 流量（完全够个人使用）

## 后续升级
如果需要后端功能（AI 批改 + 爬虫），可以：
1. 注册腾讯云函数 SCF（免费额度内 0 元）
2. 把 `api-server.js` 部署上去
3. 在前端代码里把 API 地址改为云函数地址
4. 这样前端（GitHub Pages）+ 后端（腾讯云）就都免费了
