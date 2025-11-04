/**
 * News Sentiment Analyzer
 * Analisa notícias e identifica impacto positivo/negativo no mercado
 */

class NewsSentimentAnalyzer {
    constructor() {
        this.sentimentKeywords = {
            positive: {
                high: ['crescimento forte', 'superou expectativas', 'recorde', 'recuperação robusta', 
                       'expansão', 'otimismo', 'alta demanda', 'lucro recorde', 'inovação', 
                       'acordo histórico', 'investimento massivo', 'boom', 'valorização'],
                medium: ['crescimento', 'melhora', 'positivo', 'aumento', 'alta', 'ganho', 
                         'progresso', 'recuperação', 'estável', 'confiança', 'acordo'],
                low: ['leve alta', 'pequeno aumento', 'ligeira melhora', 'tendência positiva']
            },
            negative: {
                high: ['colapso', 'crise severa', 'recessão', 'queda abrupta', 'pânico', 
                       'crash', 'desastre', 'caos', 'emergência', 'desplome', 'falência'],
                medium: ['queda', 'declínio', 'redução', 'baixa', 'perda', 'risco', 
                         'incerteza', 'preocupação', 'tensão', 'conflito', 'crise'],
                low: ['leve queda', 'pequena redução', 'cautela', 'volatilidade']
            },
            neutral: ['mantém', 'estável', 'sem mudanças', 'aguarda', 'analisa', 'monitora']
        };

        this.economicIndicators = {
            veryPositive: {
                keywords: ['PIB acima', 'desemprego cai', 'inflação controlada', 'superávit', 
                          'juros reduzidos', 'produção industrial sobe'],
                impact: 0.9,
                description: 'Indicador econômico muito positivo'
            },
            positive: {
                keywords: ['emprego', 'crescimento do PIB', 'vendas no varejo', 'confiança do consumidor',
                          'balança comercial positiva'],
                impact: 0.7,
                description: 'Indicador econômico positivo'
            },
            negative: {
                keywords: ['desemprego sobe', 'PIB cai', 'inflação alta', 'déficit', 
                          'juros sobem', 'produção cai'],
                impact: -0.7,
                description: 'Indicador econômico negativo'
            },
            veryNegative: {
                keywords: ['recessão técnica', 'crise financeira', 'default', 'hiperinflação',
                          'colapso econômico'],
                impact: -0.9,
                description: 'Indicador econômico muito negativo'
            }
        };

        this.currencyImpactMap = {
            'USD': ['Estados Unidos', 'EUA', 'Fed', 'Federal Reserve', 'dólar', 'americano'],
            'EUR': ['Europa', 'União Europeia', 'BCE', 'ECB', 'euro', 'zona do euro'],
            'GBP': ['Reino Unido', 'UK', 'Inglaterra', 'Bank of England', 'libra', 'britânico'],
            'JPY': ['Japão', 'Bank of Japan', 'BOJ', 'iene', 'japonês', 'Tóquio'],
            'CHF': ['Suíça', 'Swiss', 'franco', 'suíço'],
            'AUD': ['Austrália', 'RBA', 'australiano'],
            'CAD': ['Canadá', 'canadense', 'Bank of Canada'],
            'NZD': ['Nova Zelândia', 'RBNZ', 'neozelandês'],
            'BRL': ['Brasil', 'Banco Central', 'Brasília', 'real', 'brasileiro'],
            'XAU': ['ouro', 'gold', 'metal precioso']
        };
    }

    /**
     * Analisa o sentimento de uma notícia
     * @param {string} newsText - Texto da notícia
     * @returns {Object} Resultado da análise
     */
    analyzeSentiment(newsText) {
        const text = newsText.toLowerCase();
        
        // Detectar sentimento e impacto
        const sentiment = this.detectSentiment(text);
        const impactLevel = this.detectImpactLevel(text);
        const affectedCurrencies = this.detectAffectedCurrencies(text);
        const economicSignal = this.analyzeEconomicIndicators(text);
        const urgency = this.calculateUrgency(text, sentiment, impactLevel);
        
        return {
            sentiment: sentiment.type,
            confidence: sentiment.confidence,
            impactLevel: impactLevel,
            impactScore: sentiment.score,
            affectedCurrencies: affectedCurrencies,
            economicSignal: economicSignal,
            urgency: urgency,
            recommendation: this.generateRecommendation(sentiment, affectedCurrencies, impactLevel),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Detecta o sentimento da notícia
     */
    detectSentiment(text) {
        let positiveScore = 0;
        let negativeScore = 0;
        let matchCount = 0;

        // Contar palavras-chave positivas
        for (const [level, keywords] of Object.entries(this.sentimentKeywords.positive)) {
            const weight = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    positiveScore += weight;
                    matchCount++;
                }
            });
        }

        // Contar palavras-chave negativas
        for (const [level, keywords] of Object.entries(this.sentimentKeywords.negative)) {
            const weight = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    negativeScore += weight;
                    matchCount++;
                }
            });
        }

        // Contar palavras neutras
        const neutralMatches = this.sentimentKeywords.neutral.filter(k => text.includes(k)).length;

        const totalScore = positiveScore - negativeScore;
        const maxPossible = Math.max(positiveScore + negativeScore, 1);
        const confidence = Math.min((matchCount / 5) * 100, 100);

        let type, score;
        if (Math.abs(totalScore) < 2 || neutralMatches > matchCount) {
            type = 'neutral';
            score = 0;
        } else if (totalScore > 0) {
            type = 'positive';
            score = Math.min(totalScore / 10, 1);
        } else {
            type = 'negative';
            score = Math.max(totalScore / 10, -1);
        }

        return { type, score, confidence: Math.round(confidence) };
    }

    /**
     * Detecta o nível de impacto da notícia
     */
    detectImpactLevel(text) {
        const highImpactWords = ['banco central', 'taxa de juros', 'PIB', 'inflação', 
                                 'desemprego', 'guerra', 'crise', 'eleição'];
        const mediumImpactWords = ['política monetária', 'comércio', 'manufatura', 'vendas'];
        
        let highMatches = 0;
        let mediumMatches = 0;

        highImpactWords.forEach(word => {
            if (text.includes(word.toLowerCase())) highMatches++;
        });

        mediumImpactWords.forEach(word => {
            if (text.includes(word.toLowerCase())) mediumMatches++;
        });

        if (highMatches >= 2) return 'high';
        if (highMatches >= 1 || mediumMatches >= 2) return 'medium';
        return 'low';
    }

    /**
     * Detecta quais moedas são afetadas pela notícia
     */
    detectAffectedCurrencies(text) {
        const affected = [];

        for (const [currency, keywords] of Object.entries(this.currencyImpactMap)) {
            const matches = keywords.filter(keyword => 
                text.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                affected.push({
                    currency: currency,
                    confidence: Math.min((matches.length / keywords.length) * 100, 100),
                    matchedKeywords: matches
                });
            }
        }

        return affected.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Analisa indicadores econômicos mencionados
     */
    analyzeEconomicIndicators(text) {
        for (const [type, data] of Object.entries(this.economicIndicators)) {
            const matches = data.keywords.filter(keyword => 
                text.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                return {
                    type: type,
                    impact: data.impact,
                    description: data.description,
                    matchedIndicators: matches
                };
            }
        }

        return null;
    }

    /**
     * Calcula a urgência da notícia
     */
    calculateUrgency(text, sentiment, impactLevel) {
        const urgentWords = ['agora', 'urgente', 'breaking', 'última hora', 'alerta', 
                            'importante', 'crítico', 'imediato'];
        
        let urgencyScore = 0;

        urgentWords.forEach(word => {
            if (text.includes(word)) urgencyScore += 2;
        });

        if (impactLevel === 'high') urgencyScore += 3;
        if (impactLevel === 'medium') urgencyScore += 1;
        if (Math.abs(sentiment.score) > 0.7) urgencyScore += 2;

        if (urgencyScore >= 5) return 'critical';
        if (urgencyScore >= 3) return 'high';
        if (urgencyScore >= 1) return 'medium';
        return 'low';
    }

    /**
     * Gera recomendação baseada na análise
     */
    generateRecommendation(sentiment, affectedCurrencies, impactLevel) {
        if (sentiment.type === 'neutral' || affectedCurrencies.length === 0) {
            return {
                action: 'hold',
                description: 'Aguardar mais informações antes de tomar decisões',
                pairs: []
            };
        }

        const recommendations = [];
        const primaryCurrency = affectedCurrencies[0];

        if (sentiment.type === 'positive') {
            recommendations.push({
                action: 'buy',
                description: `Considerar compra de ${primaryCurrency.currency}`,
                reason: `Notícia positiva com impacto ${impactLevel}`,
                pairs: this.generateTradingPairs(primaryCurrency.currency, true)
            });
        } else {
            recommendations.push({
                action: 'sell',
                description: `Considerar venda de ${primaryCurrency.currency}`,
                reason: `Notícia negativa com impacto ${impactLevel}`,
                pairs: this.generateTradingPairs(primaryCurrency.currency, false)
            });
        }

        return recommendations[0];
    }

    /**
     * Gera pares de trading sugeridos
     */
    generateTradingPairs(currency, isBullish) {
        const majorPairs = {
            'USD': ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
            'EUR': ['EURUSD', 'EURGBP', 'EURJPY', 'EURAUD'],
            'GBP': ['GBPUSD', 'EURGBP', 'GBPJPY', 'GBPAUD'],
            'JPY': ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'],
            'XAU': ['XAUUSD']
        };

        const pairs = majorPairs[currency] || [];
        return pairs.map(pair => ({
            pair: pair,
            direction: isBullish ? 'BUY' : 'SELL',
            confidence: 'medium'
        }));
    }

    /**
     * Simula feed de notícias em tempo real (mock data)
     */
    getMockNewsData() {
        return [
            {
                id: 1,
                title: 'Fed mantém taxa de juros estável em 5,25%',
                content: 'O Federal Reserve decidiu manter a taxa de juros sem mudanças, sinalizando cautela com a inflação. Mercados reagem positivamente à decisão.',
                source: 'Reuters',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                category: 'monetary_policy'
            },
            {
                id: 2,
                title: 'PIB dos EUA supera expectativas com crescimento de 3,2%',
                content: 'Economia americana mostra crescimento forte acima das expectativas. Analistas revisam projeções para cima.',
                source: 'Bloomberg',
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                category: 'economic_data'
            },
            {
                id: 3,
                title: 'Banco Central Europeu preocupado com inflação na Zona do Euro',
                content: 'BCE sinaliza possível aumento de juros devido à inflação persistente acima da meta de 2%.',
                source: 'Financial Times',
                timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                category: 'monetary_policy'
            },
            {
                id: 4,
                title: 'Ouro atinge nova máxima histórica em meio a incertezas globais',
                content: 'Tensões geopolíticas e busca por ativos seguros impulsionam preço do ouro para recorde.',
                source: 'CNBC',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                category: 'commodities'
            },
            {
                id: 5,
                title: 'Banco Central do Brasil reduz Selic para 10,75%',
                content: 'BC do Brasil inicia ciclo de cortes de juros com redução de 0,25 pontos percentuais.',
                source: 'Valor Econômico',
                timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                category: 'monetary_policy'
            }
        ];
    }

    /**
     * Analisa múltiplas notícias e retorna resumo
     */
    analyzeNewsStream(newsArray) {
        const analyses = newsArray.map(news => {
            const analysis = this.analyzeSentiment(news.title + ' ' + news.content);
            return {
                ...news,
                analysis: analysis
            };
        });

        // Ordenar por urgência e impacto
        return analyses.sort((a, b) => {
            const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
            const impactWeight = { high: 3, medium: 2, low: 1 };
            
            const scoreA = urgencyWeight[a.analysis.urgency] + impactWeight[a.analysis.impactLevel];
            const scoreB = urgencyWeight[b.analysis.urgency] + impactWeight[b.analysis.impactLevel];
            
            return scoreB - scoreA;
        });
    }

    /**
     * Gera alerta de notícia importante
     */
    generateNewsAlert(newsAnalysis) {
        const { sentiment, impactLevel, urgency, affectedCurrencies, recommendation } = newsAnalysis.analysis;
        
        let emoji = sentiment === 'positive' ? '📈' : sentiment === 'negative' ? '📉' : '➖';
        let urgencyEmoji = urgency === 'critical' ? '🚨' : urgency === 'high' ? '⚠️' : urgency === 'medium' ? '📢' : '📰';
        
        return {
            title: `${urgencyEmoji} ${newsAnalysis.title}`,
            message: recommendation.description,
            type: sentiment,
            priority: urgency,
            currencies: affectedCurrencies.map(c => c.currency).join(', '),
            action: recommendation.action,
            timestamp: newsAnalysis.timestamp
        };
    }
}

// Exportar para uso global
window.NewsSentimentAnalyzer = NewsSentimentAnalyzer;
