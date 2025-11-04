/**
 * Indicador Pullback Avançado com Filtro de Volatilidade
 * Detecta tendência via EMA20/EMA50, identifica pullbacks em múltiplos níveis
 * Adiciona filtro de volatilidade usando ATR para reduzir sinais falsos
 */

class PullbackIndicator {
    constructor(config = {}) {
        this.config = {
            emaFast: config.emaFast || 20,
            emaSlow: config.emaSlow || 50,
            atrPeriod: config.atrPeriod || 14,
            atrMinMult: config.atrMinMult || 0.2, // Mínimo de volatilidade para aceitar rompimento
            enablePush: config.enablePush !== undefined ? config.enablePush : true,
            arrowOffset: config.arrowOffset || 10,
            maxLevels: config.maxLevels || 5,
            maxBarsToKeep: config.maxBarsToKeep || 500,
            timeframe: config.timeframe || 'M15'
        };

        this.levels = [];
        this.signals = [];
    }

    /**
     * Calcula EMA (Exponential Moving Average)
     */
    calculateEMA(data, period) {
        if (data.length < period) return null;

        const multiplier = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * Calcula ATR (Average True Range)
     */
    calculateATR(candles, period) {
        if (candles.length < period + 1) return null;

        const trueRanges = [];
        
        for (let i = 1; i < candles.length; i++) {
            const high = candles[i].high;
            const low = candles[i].low;
            const prevClose = candles[i - 1].close;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );

            trueRanges.push(tr);
        }

        // Calcular ATR como média dos True Ranges
        const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
        return atr;
    }

    /**
     * Detecta rompimentos com filtro de volatilidade
     */
    detectBreakout(candles) {
        if (candles.length < Math.max(this.config.emaSlow, this.config.atrPeriod) + 4) {
            return null;
        }

        // Pegar últimos 4 candles
        const recentCandles = candles.slice(-4);
        const [c3, c2, c1, c0] = recentCandles;

        // Calcular EMAs
        const closePrices = candles.map(c => c.close);
        const emaFast = this.calculateEMA(closePrices, this.config.emaFast);
        const emaSlow = this.calculateEMA(closePrices, this.config.emaSlow);

        if (!emaFast || !emaSlow) return null;

        // Detectar tendência
        const trendUp = emaFast > emaSlow;
        const trendDown = emaFast < emaSlow;

        // Calcular ATR
        const atr = this.calculateATR(candles, this.config.atrPeriod);
        if (!atr) return null;

        const minVolatility = atr * this.config.atrMinMult;

        // Verificar se já atingiu o máximo de níveis
        if (this.levels.length >= this.config.maxLevels) {
            return null;
        }

        // Detectar rompimento bullish com filtro ATR
        if (trendUp && c1.high > c2.high) {
            const breakoutSize = Math.abs(c1.high - c2.high);
            if (breakoutSize >= minVolatility) {
                return {
                    type: 'bullish',
                    price: c2.high,
                    direction: 1,
                    time: c1.time || Date.now(),
                    atr: atr,
                    breakoutSize: breakoutSize
                };
            }
        }

        // Detectar rompimento bearish com filtro ATR
        if (trendDown && c1.low < c2.low) {
            const breakoutSize = Math.abs(c1.low - c2.low);
            if (breakoutSize >= minVolatility) {
                return {
                    type: 'bearish',
                    price: c2.low,
                    direction: -1,
                    time: c1.time || Date.now(),
                    atr: atr,
                    breakoutSize: breakoutSize
                };
            }
        }

        return null;
    }

    /**
     * Adiciona um novo nível de pullback
     */
    addLevel(breakout) {
        const level = {
            price: breakout.price,
            direction: breakout.direction,
            type: breakout.type,
            timeCreated: breakout.time,
            id: `pullback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            atr: breakout.atr,
            breakoutSize: breakout.breakoutSize
        };

        this.levels.push(level);
        return level;
    }

    /**
     * Remove um nível de pullback
     */
    removeLevel(levelId) {
        const index = this.levels.findIndex(lvl => lvl.id === levelId);
        if (index !== -1) {
            this.levels.splice(index, 1);
        }
    }

    /**
     * Verifica se o preço tocou algum nível e confirma com candle
     */
    checkLevelTouch(candles) {
        if (candles.length < 2) return [];

        const currentCandle = candles[candles.length - 1];
        const signals = [];

        // Verificar cada nível ativo
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            
            // Verificar se o preço tocou o nível
            const priceTouched = currentCandle.low <= level.price && level.price <= currentCandle.high;

            if (priceTouched) {
                let confirmed = false;

                // Confirmar com padrão de candle
                if (level.direction === 1 && currentCandle.close > currentCandle.open) {
                    // Pullback bullish confirmado (candle de alta)
                    confirmed = true;
                } else if (level.direction === -1 && currentCandle.close < currentCandle.open) {
                    // Pullback bearish confirmado (candle de baixa)
                    confirmed = true;
                }

                if (confirmed) {
                    const signal = {
                        type: level.direction === 1 ? 'BUY' : 'SELL',
                        price: level.price,
                        time: currentCandle.time || Date.now(),
                        arrowPrice: level.direction === 1 
                            ? currentCandle.low - (this.config.arrowOffset * 0.0001)
                            : currentCandle.high + (this.config.arrowOffset * 0.0001),
                        level: level,
                        confidence: this.calculateConfidence(level, currentCandle)
                    };

                    signals.push(signal);
                    this.signals.push(signal);

                    // Enviar notificação se habilitado
                    if (this.config.enablePush) {
                        this.sendNotification(signal);
                    }

                    // Remover o nível após gerar sinal
                    this.removeLevel(level.id);
                }
            }
        }

        return signals;
    }

    /**
     * Calcula a confiança do sinal baseado em múltiplos fatores
     */
    calculateConfidence(level, candle) {
        let confidence = 50; // Base 50%

        // Aumentar confiança baseado no tamanho do rompimento vs ATR
        const breakoutRatio = level.breakoutSize / level.atr;
        if (breakoutRatio > 0.5) confidence += 15;
        if (breakoutRatio > 1.0) confidence += 10;

        // Aumentar confiança baseado no tamanho do candle de confirmação
        const candleSize = Math.abs(candle.close - candle.open);
        const candleRange = candle.high - candle.low;
        const bodyRatio = candleSize / candleRange;

        if (bodyRatio > 0.6) confidence += 15; // Candle com corpo forte
        if (bodyRatio > 0.8) confidence += 10; // Candle muito forte

        return Math.min(confidence, 95); // Máximo 95%
    }

    /**
     * Envia notificação de sinal
     */
    sendNotification(signal) {
        const message = `🎯 PULLBACK ${signal.type} detectado!\n` +
                       `Preço: ${signal.price.toFixed(5)}\n` +
                       `Confiança: ${signal.confidence}%\n` +
                       `Timeframe: ${this.config.timeframe}`;

        console.log(message);

        // Notificação do navegador se permitido
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sinal de Pullback', {
                body: message,
                icon: 'assets/icon-192.png',
                badge: 'assets/icon-72.png',
                tag: `pullback-${signal.time}`,
                requireInteraction: true
            });
        }

        // Alert visual
        if (typeof window !== 'undefined') {
            // Criar toast notification customizado
            this.showToast(message, signal.type);
        }
    }

    /**
     * Mostra toast notification na interface
     */
    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `pullback-toast pullback-toast-${type.toLowerCase()}`;
        toast.innerHTML = `
            <div class="pullback-toast-icon">${type === 'BUY' ? '📈' : '📉'}</div>
            <div class="pullback-toast-content">${message.replace(/\n/g, '<br>')}</div>
        `;

        document.body.appendChild(toast);

        // Animar entrada
        setTimeout(() => toast.classList.add('pullback-toast-show'), 10);

        // Remover após 5 segundos
        setTimeout(() => {
            toast.classList.remove('pullback-toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    /**
     * Analisa os candles e retorna níveis e sinais
     */
    analyze(candles) {
        // Detectar novos rompimentos
        const breakout = this.detectBreakout(candles);
        if (breakout) {
            this.addLevel(breakout);
        }

        // Verificar toques nos níveis existentes
        const newSignals = this.checkLevelTouch(candles);

        return {
            levels: this.levels,
            signals: newSignals,
            allSignals: this.signals,
            lastBreakout: breakout
        };
    }

    /**
     * Limpa níveis antigos
     */
    cleanupOldLevels(maxAgeMinutes = 60) {
        const now = Date.now();
        const maxAge = maxAgeMinutes * 60 * 1000;

        this.levels = this.levels.filter(level => {
            return (now - level.timeCreated) < maxAge;
        });
    }

    /**
     * Reseta o indicador
     */
    reset() {
        this.levels = [];
        this.signals = [];
    }

    /**
     * Exporta configuração
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Atualiza configuração
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Obtém estatísticas
     */
    getStats() {
        const buySignals = this.signals.filter(s => s.type === 'BUY').length;
        const sellSignals = this.signals.filter(s => s.type === 'SELL').length;
        const avgConfidence = this.signals.length > 0
            ? this.signals.reduce((sum, s) => sum + s.confidence, 0) / this.signals.length
            : 0;

        return {
            totalSignals: this.signals.length,
            buySignals,
            sellSignals,
            activeLevels: this.levels.length,
            averageConfidence: avgConfidence.toFixed(1),
            lastSignal: this.signals[this.signals.length - 1] || null
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PullbackIndicator = PullbackIndicator;
}

// Exportar para Node.js se disponível
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PullbackIndicator;
}
