#!/bin/bash
# 🚀 Script de Deploy para GitHub

echo "📊 Forex Analyzer PWA - Deploy Script"
echo "======================================"

# Verificar se Git está configurado
echo "🔧 Verificando configuração do Git..."
git config --global user.name || echo "⚠️  Configure: git config --global user.name 'Seu Nome'"
git config --global user.email || echo "⚠️  Configure: git config --global user.email 'seu@email.com'"

# Verificar status do repositório
echo ""
echo "📋 Status do repositório:"
git status

# Adicionar arquivos de deploy
echo ""
echo "📦 Adicionando novos arquivos..."
git add DEPLOY-GITHUB.md
git add .github/workflows/deploy.yml

# Fazer commit dos arquivos de deploy
git commit -m "🔧 Add GitHub Pages deploy configuration

✨ Added:
- GitHub Actions workflow for automatic deployment
- Detailed deployment instructions
- PWA validation steps
- Performance optimization checks

🚀 Ready for GitHub Pages!"

echo ""
echo "✅ Arquivos de deploy commitados!"
echo ""
echo "🌐 PRÓXIMOS PASSOS:"
echo "==================="
echo ""
echo "1. 📝 CRIAR REPOSITÓRIO NO GITHUB:"
echo "   - Vá para: https://github.com/new"
echo "   - Nome: forex-analyzer"
echo "   - Público: ✅"
echo "   - NÃO adicionar README (já temos)"
echo ""
echo "2. 🔗 CONECTAR REPOSITÓRIO:"
echo "   Execute após criar no GitHub:"
echo "   git remote add origin https://github.com/SEU_USUARIO/forex-analyzer.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. ⚙️ ATIVAR GITHUB PAGES:"
echo "   - Vá para Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main / (root)"
echo "   - Save"
echo ""
echo "4. 🎉 ACESSAR SEU APP:"
echo "   https://SEU_USUARIO.github.io/forex-analyzer/"
echo ""
echo "📱 Seu PWA estará pronto para instalar em qualquer dispositivo!"