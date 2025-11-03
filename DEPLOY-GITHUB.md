# 🚀 Instruções para Deploy no GitHub Pages

## Passo 1: Criar Repositório no GitHub

### Via Interface Web (Recomendado)
1. **Acesse**: https://github.com/new
2. **Nome do repositório**: `forex-analyzer` (ou outro nome de sua escolha)
3. **Descrição**: `Forex Candle Strength Analyzer PWA - Análise técnica profissional`
4. **Visibilidade**: Public (necessário para GitHub Pages gratuito)
5. **NÃO marque**: "Add a README file" (já temos um)
6. **Clique**: "Create repository"

### Via GitHub CLI (Alternativo)
```bash
# Instalar GitHub CLI se não tiver
gh repo create forex-analyzer --public --description "Forex Candle Strength Analyzer PWA"
```

## Passo 2: Conectar Repositório Local

Após criar o repositório no GitHub, execute os comandos que aparecerão na página:

```bash
# Adicionar origin (substitua YOUR_USERNAME pelo seu usuário GitHub)
git remote add origin https://github.com/YOUR_USERNAME/forex-analyzer.git

# Verificar se foi adicionado
git remote -v

# Fazer push do código
git branch -M main
git push -u origin main
```

## Passo 3: Ativar GitHub Pages

1. **Vá para seu repositório**: `https://github.com/YOUR_USERNAME/forex-analyzer`
2. **Clique em "Settings"** (aba no topo)
3. **No menu lateral esquerdo**, clique em **"Pages"**
4. **Em "Source"**: Selecione "Deploy from a branch"
5. **Em "Branch"**: Selecione "main" e "/ (root)"
6. **Clique "Save"**

## Passo 4: Aguardar Deploy

- ⏱️ O deploy pode levar 2-10 minutos
- 📧 Você receberá um email quando estiver pronto
- 🔗 Seu app estará disponível em: `https://YOUR_USERNAME.github.io/forex-analyzer/`

## Passo 5: Verificar PWA

Após o deploy:

1. **Acesse seu app**: `https://YOUR_USERNAME.github.io/forex-analyzer/`
2. **Teste a instalação**: Procure o botão "Instalar" no navegador
3. **Teste offline**: Desconecte a internet e verifique se funciona
4. **Teste mobile**: Acesse no celular e teste "Adicionar à tela inicial"

## 🔧 Comandos Git Úteis

```bash
# Verificar status
git status

# Adicionar novos arquivos
git add .

# Fazer commit
git commit -m "✨ Adicionar nova funcionalidade"

# Enviar para GitHub
git push

# Ver repositórios remotos
git remote -v

# Ver histórico de commits
git log --oneline
```

## 🎯 Atualizações Futuras

Para atualizar seu app:

```bash
# Fazer alterações nos arquivos
# Adicionar ao git
git add .

# Commit com descrição
git commit -m "🔄 Atualizar indicadores técnicos"

# Push para GitHub (deploy automático)
git push
```

## 🐛 Resolução de Problemas

### Erro de Permissão
```bash
# Se der erro de permissão, configure seu usuário Git
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@example.com"
```

### Remote já existe
```bash
# Se der erro que remote já existe
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/forex-analyzer.git
```

### GitHub Pages não aparece
- Verifique se o repositório é público
- Aguarde até 10 minutos após ativar
- Verifique se há arquivos na branch main

## 📊 Recursos Adicionais

### Custom Domain (Opcional)
1. Compre um domínio (exemplo: forexanalyzer.com)
2. Em Settings → Pages → Custom domain
3. Configure DNS do domínio para apontar para GitHub Pages

### GitHub Actions (Deploy Automático)
```yaml
# .github/workflows/deploy.yml
name: Deploy PWA
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado com `git push`
- [ ] GitHub Pages ativado
- [ ] App funcionando online
- [ ] PWA instalável
- [ ] Funcionalidade offline testada
- [ ] URLs atualizadas no README

---

🎉 **Parabéns!** Seu Forex Analyzer PWA está agora hospedado no GitHub Pages e acessível mundialmente!

**📱 Compartilhe seu app**: `https://YOUR_USERNAME.github.io/forex-analyzer/`