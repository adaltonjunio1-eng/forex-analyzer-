# 📊 Forex Candle Strength Analyzer PWA

> **Aplicativo Progressive Web App para análise de força de candles no mercado forex com indicadores técnicos em tempo real**

[![Deploy Status](https://img.shields.io/badge/deploy-github%20pages-brightgreen)](https://your-username.github.io/forex-analyzer)
[![PWA](https://img.shields.io/badge/PWA-enabled-blue)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Características

### 📱 Progressive Web App
- **Instalável**: Funciona como app nativo no celular/desktop
- **Offline**: Funciona sem internet usando dados em cache
- **Responsivo**: Otimizado para mobile, tablet e desktop
- **Rápido**: Service Worker para performance máxima

### 📈 Análise Técnica Avançada
- **Indicadores**: RSI, MACD, Bollinger Bands, Stochastic, Williams %R, ADX, CCI
- **Padrões**: 15+ padrões de candlestick (Doji, Hammer, Engulfing, etc.)
- **Sinais**: Sistema inteligente de buy/sell com scoring
- **Gráficos**: Visualização profissional com Chart.js

### ⚡ Funcionalidades
- Análise em tempo real
- Múltiplos pares de moedas
- Diferentes timeframes
- Alertas de trading
- Dashboard completo
- Configurações personalizáveis

## 🚀 Demo Online

**[🌐 Acessar App](https://your-username.github.io/forex-analyzer/)**

*Ou instale como PWA clicando no botão de instalação no navegador*

## 📱 Instalação

### Como PWA (Recomendado)
1. Acesse: `https://your-username.github.io/forex-analyzer/`
2. Clique no botão "📱 Instalar App" 
3. Ou no mobile: Menu → "Adicionar à tela inicial"

### Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/your-username/forex-analyzer.git
cd forex-analyzer

# Instale dependências
npm install

# Inicie servidor local
npm start
# ou
python -m http.server 8080

# Acesse
open http://localhost:8080
```

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Charts**: Chart.js
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Font Awesome
- **Hosting**: GitHub Pages

## 📊 Indicadores Suportados

| Indicador | Descrição | Período |
|-----------|-----------|---------|
| **RSI** | Relative Strength Index | 14 |
| **MACD** | Moving Average Convergence Divergence | 12,26,9 |
| **Bollinger Bands** | Bandas de volatilidade | 20,2 |
| **Stochastic** | Oscilador estocástico | 14,3,3 |
| **Williams %R** | Williams Percent Range | 14 |
| **ADX** | Average Directional Index | 14 |
| **CCI** | Commodity Channel Index | 20 |

## 🕯️ Padrões de Candlestick

### Padrões de Reversão
- Doji, Hammer, Shooting Star
- Engulfing (Bullish/Bearish)
- Morning/Evening Star
- Harami (Inside/Outside)

### Padrões de Continuação  
- Three White Soldiers
- Three Black Crows
- Rising/Falling Three Methods

## 🎯 Como Usar

1. **Selecione o par de moedas** (EUR/USD, GBP/USD, etc.)
2. **Escolha o timeframe** (5m, 15m, 1h, 4h, 1d)
3. **Clique em "Analisar"** para gerar análise completa
4. **Visualize sinais** na seção de sinais de trading
5. **Configure alertas** nas configurações

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
forex-analyzer/
├── index.html              # Página principal
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── css/
│   └── style.css           # Estilos responsivos
├── js/
│   ├── app.js              # Controlador principal
│   ├── chart.js            # Gráficos Chart.js
│   ├── indicators.js       # Indicadores técnicos
│   ├── patterns.js         # Padrões candlestick
│   ├── signals.js          # Sistema de sinais
│   └── utils.js            # Utilitários
└── assets/
    └── icon-*.png          # Ícones PWA
```

### Scripts Disponíveis
```bash
npm start          # Servidor de desenvolvimento
npm run icons      # Gerar ícones PWA
npm run build      # Build para produção
```

## 📈 Roadmap

- [ ] Integração com APIs reais de forex
- [ ] Notificações push para alertas
- [ ] Histórico de análises
- [ ] Backtesting de estratégias
- [ ] Mais pares de moedas
- [ ] Análise multi-timeframe

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Chart.js](https://www.chartjs.org/) para gráficos
- [Font Awesome](https://fontawesome.com/) para ícones
- Comunidade forex pela inspiração

---

<div align="center">

**[⭐ Star este projeto](https://github.com/your-username/forex-analyzer/stargazers)** • **[🐛 Reportar Bug](https://github.com/your-username/forex-analyzer/issues)** • **[💡 Sugerir Feature](https://github.com/your-username/forex-analyzer/issues)**

Feito com ❤️ para traders

</div>

### 📊 Análise Técnica Avançada
- **Indicadores Técnicos**: RSI, MACD, Bollinger Bands, Stochastic, Williams %R, ADX, CCI
- **Padrões de Candles**: Detecção automática de 15+ padrões (Doji, Hammer, Engulfing, etc.)
- **Suporte e Resistência**: Identificação automática de níveis críticos
- **Análise de Volume**: Gráficos de volume integrados

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Tema Dark**: Interface otimizada para trading noturno
- **Animações Suaves**: Transições e efeitos visuais profissionais
- **PWA Ready**: Instalável como aplicativo nativo

### 🔔 Sistema de Sinais
- **Geração Automática**: Sinais de compra/venda baseados em múltiplos indicadores
- **Alertas em Tempo Real**: Notificações push e sonoras
- **Histórico de Sinais**: Rastreamento de performance
- **Filtros Avançados**: Filtragem por tipo de sinal e força

### ⚙️ Configurações Avançadas
- **Atualização Automática**: Intervalo configurável (5s - 5min)
- **Personalização de Indicadores**: Períodos ajustáveis para RSI, MACD, etc.
- **Múltiplos Pares**: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD
- **Timeframes**: 1m, 5m, 15m, 30m, 1h, 4h, 1d

## 🚀 Como Usar

### Instalação Rápida

1. **Clone o repositório**:
```bash
git clone https://github.com/username/forex-candle-analyzer.git
cd forex-candle-analyzer
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**:
```bash
npm start
```

4. **Acesse o aplicativo**:
   - Abra seu navegador em `http://localhost:3000`
   - Ou use a task "Iniciar Servidor de Desenvolvimento" no VS Code

### Como Instalar como PWA

1. Abra o app no navegador
2. Clique no ícone de "Instalar" na barra de endereços
3. Confirme a instalação
4. Use como aplicativo nativo!

## 📱 Funcionalidades Detalhadas

### Dashboard Principal
- **Seletor de Pares**: Troque entre diferentes pares de moedas
- **Seletor de Timeframe**: Analise em diferentes períodos
- **Estatísticas em Tempo Real**: Preço atual, força do candle, RSI, sinal ativo
- **Gráfico Principal**: Visualização de preços com indicadores sobrepostos

### Seção de Análise
- **Padrões de Candles**: Lista de padrões detectados com força e confiabilidade
- **Indicadores Técnicos**: Valores atuais e status de todos os indicadores
- **Gráfico de Volume**: Análise de volume dos últimos períodos
- **Níveis de S/R**: Suporte e resistência identificados automaticamente

### Seção de Sinais
- **Lista de Sinais**: Histórico completo com timestamps
- **Filtros**: Visualize apenas sinais de compra, venda ou neutros
- **Alertas**: Toggle para ativar/desativar notificações
- **Estatísticas**: Performance e accuracy dos sinais

### Configurações
- **Gerais**: Auto-refresh, intervalos, alertas sonoros
- **Aparência**: Tema, tipo de gráfico, cores
- **Indicadores**: Períodos customizáveis para cada indicador

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Variáveis CSS, Grid Layout, Flexbox, Animações
- **JavaScript ES6+**: Classes, Módulos, Async/Await, LocalStorage
- **Chart.js**: Biblioteca de gráficos responsivos

### Indicadores Técnicos
- **RSI (Relative Strength Index)**: Identificação de sobrecompra/sobrevenda
- **MACD**: Convergência e divergência de médias móveis
- **Bollinger Bands**: Bandas de volatilidade
- **Stochastic Oscillator**: Momento de preço
- **Williams %R**: Indicador de momentum
- **ADX**: Força da tendência
- **CCI**: Commodity Channel Index

### Padrões de Candles
- **Reversal**: Doji, Hammer, Shooting Star, Hanging Man, Inverted Hammer
- **Continuation**: Marubozu, Spinning Top
- **Two-Candle**: Engulfing, Harami, Piercing Line, Dark Cloud Cover
- **Three-Candle**: Three White Soldiers, Three Black Crows

## 📊 Estrutura do Projeto

```
forex-candle-analyzer/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── package.json            # Dependências e scripts
├── .github/
│   └── copilot-instructions.md
├── css/
│   └── style.css           # Estilos principais
├── js/
│   ├── app.js              # Controlador principal
│   ├── chart.js            # Gerenciamento de gráficos
│   ├── indicators.js       # Indicadores técnicos
│   ├── patterns.js         # Padrões de candles
│   ├── signals.js          # Sistema de sinais
│   └── utils.js            # Funções utilitárias
├── assets/
│   ├── icon-192.png        # Ícone PWA 192x192
│   └── icon-512.png        # Ícone PWA 512x512
└── .vscode/
    └── tasks.json          # Tasks do VS Code
```

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Iniciar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm test

# Gerar ícones PWA
npm run generate-icons
```

## 📈 Dados e API

**Nota**: Esta versão utiliza dados simulados para demonstração. Para uso em produção, recomenda-se integrar com APIs reais de forex como:

- **Alpha Vantage**: Dados gratuitos com limite
- **Fixer.io**: Taxas de câmbio em tempo real
- **Oanda API**: Dados profissionais de forex
- **MetaTrader 5**: WebAPI para dados MT5

### Integração de API (Exemplo)

```javascript
// Exemplo de integração com API real
async function fetchRealTimeData(pair, timeframe) {
    const response = await fetch(`https://api.example.com/forex/${pair}/${timeframe}`);
    const data = await response.json();
    return data.candles;
}
```

## 🎨 Personalização

### Alterando Cores do Tema

Edite as variáveis CSS em `css/style.css`:

```css
:root {
    --primary-color: #0052ff;      /* Cor principal */
    --secondary-color: #00d4aa;    /* Cor secundária */
    --background-color: #0a0a0f;   /* Fundo */
    --surface-color: #1a1a2e;      /* Superfícies */
    --success-color: #00ff88;      /* Sinais de compra */
    --danger-color: #ff4757;       /* Sinais de venda */
}
```

### Adicionando Novos Indicadores

1. Implemente a lógica em `js/indicators.js`
2. Adicione ao método `calculateAllIndicators()`
3. Inclua na análise em `js/signals.js`
4. Atualize a UI em `js/app.js`

### Customizando Padrões de Candles

Adicione novos padrões em `js/patterns.js`:

```javascript
static detectCustomPattern(candle) {
    // Sua lógica aqui
    return {
        name: 'Custom Pattern',
        type: 'bullish_reversal',
        reliability: 'high',
        description: 'Descrição do padrão'
    };
}
```

## 📱 PWA Features

- **Offline Support**: Funciona sem conexão com internet
- **Install Prompt**: Instalação nativa em dispositivos
- **Push Notifications**: Alertas de sinais importantes
- **Background Sync**: Atualização em segundo plano
- **Responsive Design**: Interface adaptável

## 🔐 Segurança e Performance

- **CSP Headers**: Content Security Policy implementado
- **Lazy Loading**: Carregamento otimizado de recursos
- **Code Splitting**: Divisão inteligente do código
- **Caching Strategy**: Cache inteligente para melhor performance
- **Error Handling**: Tratamento robusto de erros

## 🚀 Deploy

### GitHub Pages
```bash
# Build automático via GitHub Actions
git push origin main
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
./
```

### Vercel
```bash
# Deploy automático conectado ao GitHub
vercel --prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- 📧 Email: support@forexanalyzer.com
- 💬 Discord: [Community Server](https://discord.gg/forexanalyzer)
- 📱 Telegram: [@ForexAnalyzerBot](https://t.me/ForexAnalyzerBot)
- 🐛 Issues: [GitHub Issues](https://github.com/username/forex-candle-analyzer/issues)

## 🙏 Agradecimentos

- **Chart.js**: Biblioteca de gráficos incrível
- **Font Awesome**: Ícones profissionais
- **Forex Community**: Inspiração e feedback
- **VS Code**: Melhor editor para desenvolvimento

---

**⚠️ Disclaimer**: Este software é apenas para fins educacionais. Trading no mercado forex envolve riscos significativos. Sempre consulte um consultor financeiro qualificado antes de tomar decisões de investimento.

**🎯 Happy Trading!** 📈🚀