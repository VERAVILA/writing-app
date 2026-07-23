#!/bin/bash
# ============================================================
#  一键部署辅助脚本
#  帮您把代码推送到 GitHub，自动获得永久免费链接
# ============================================================
# 使用方法：
#   chmod +x deploy-helper.sh
#   ./deploy-helper.sh
# ============================================================

echo "=========================================="
echo "  墨练 · 写作练习APP · 一键部署"
echo "=========================================="
echo ""

# 检查 git
if ! command -v git &> /dev/null; then
    echo "❌ 未安装 Git，请先安装：https://git-scm.com/"
    exit 1
fi

# 获取用户名
read -p "请输入你的 GitHub 用户名: " GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

# 仓库名
read -p "请输入仓库名（默认: writing-app）: " REPO_NAME
REPO_NAME=${REPO_NAME:-writing-app}

echo ""
echo "📦 准备部署到: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""

# 初始化 git
cd "$(dirname "$0")"
git init 2>/dev/null
git add .
git commit -m "🚀 墨练写作练习APP - 68种技巧+226条例句" 2>/dev/null

# 添加远程
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "=========================================="
echo "下一步操作："
echo "=========================================="
echo ""
echo "1️⃣  先在 GitHub 上创建仓库："
echo "    https://github.com/new"
echo "    仓库名: ${REPO_NAME}"
echo "    设为 Public"
echo "    不要勾选 README"
echo ""
echo "2️⃣  然后执行推送："
echo "    git push -u origin main"
echo ""
echo "3️⃣  推送后开启 GitHub Pages："
echo "    仓库 Settings → Pages → Source 选 'GitHub Actions'"
echo ""
echo "4️⃣  等待 1-2 分钟，访问："
echo "    https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo ""
echo "=========================================="
echo "💡 提示：如果想用 SSH 推送（免每次输密码）："
echo "   git remote set-url origin git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
echo "=========================================="
