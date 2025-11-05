/**
 * PullbackMultiSignal - Indicador avançado que combina 4 lógicas:
 * 1. EMA20/EMA50 (tendência + toque na EMA20)
 * 2. Fibonacci automático (50% / 61.8% do impulso recente)
 * 3. RSI + Candle de rejeição (pavio grande)
 * 4. Bollinger Bands (fora da banda -> retorno à média)
 * 
 * Gera sinal quando 2 ou mais lógicas confirmam (configurável)
 */

class PullbackMultiSignal {
    constructor(config = {}) {
        this.config = {
            emaFastPeriod: config.emaFastPeriod || 20,
            emaSlowPeriod: config.emaSlowPeriod || 50,
            bbPeriod: config.bbPeriod || 20,
            bbDeviation: config.bbDeviation || 2.0,
            rsiPeriod: config.rsiPeriod || 14,
            lookbackImpulse: config.lookbackImpulse || 60,
            wickFactor: config.wickFactor || 200, // pavio em % do corpo (200 = 2x)
            emaTouchPips: config.emaTouchPips || 8.0,
            minSignalsToConfirm: config.minSignalsToConfirm || 2,
            alertPopup: config.alertPopup !== undefined ? config.alertPopup : true,
            alertSound: config.alertSound !== undefined ? config.alertSound : true,
            alertPush: config.alertPush !== undefined ? config.alertPush : true,
            soundFile: config.soundFile || 'alert.wav',
            timeframe: config.timeframe || 'M15'
        };

        this.signals = [];
        this.lastSignalTime = 0;
    }

    /**
     * Calcula EMA
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
     * Calcula RSI
     */
    calculateRSI(candles, period) {
        if (candles.length < period + 1) return null;

        const changes = [];
        for (let i = 1; i < candles.length; i++) {
            changes.push(candles[i].close - candles[i - 1].close);
        }

        let gains = 0, losses = 0;
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) gains += changes[i];
            else losses += Math.abs(changes[i]);
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        for (let i = period; i < changes.length; i++) {
            const change = changes[i];
            avgGain = ((avgGain * (period - 1)) + (change > 0 ? change : 0)) / period;
            avgLoss = ((avgLoss * (period - 1)) + (change < 0 ? Math.abs(change) : 0)) / period;
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calcula Standard Deviation
     */
    calculateStdDev(data, period) {
        if (data.length < period) return null;

        const slice = data.slice(-period);
        const mean = slice.reduce((sum, val) => sum + val, 0) / period;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        return Math.sqrt(variance);
    }

    /**
     * Detecta pullback usando múltiplos sinais
     */
    analyzeMultiSignal(candles) {
        if (candles.length < Math.max(
            this.config.emaSlowPeriod,
            this.config.lookbackImpulse,
            this.config.bbPeriod,
            this.config.rsiPeriod
        ) + 10) {
            return null;
        }

        const current = candles[candles.length - 1];
        const previous = candles[candles.length - 2];

        // 1. SINAL EMA - Tendência e toque na EMA20
        const emaSignal = this.checkEMASignal(candles, current);

        // 2. SINAL FIBONACCI - Retração 50% / 61.8%
        const fibSignal = this.checkFibonacciSignal(candles, current, emaSignal.trend);

        // 3. SINAL RSI + CANDLE - Rejeição com pavio grande
        const rsiCandleSignal = this.checkRSICandleSignal(candles, current, emaSignal.trend);

        // 4. SINAL BOLLINGER BANDS - Retorno à média
        const bollingerSignal = this.checkBollingerSignal(candles, current);

        // Contar sinais confirmados
        const signals = {
            ema: emaSignal.signal,
            fibonacci: fibSignal,
            rsiCandle: rsiCandleSignal,
            bollinger: bollingerSignal
        };

        const confirmedCount = Object.values(signals).filter(s => s === true).length;

        // Gerar sinal se atingiu o mínimo necessário
        if (confirmedCount >= this.config.minSignalsToConfirm) {
            const signal = {
                type: emaSignal.trend === 'up' ? 'BUY' : 'SELL',
                price: current.close,
                time: current.time || Date.now(),
                confirmedSignals: confirmedCount,
                signals: signals,
                confidence: this.calculateConfidence(confirmedCount, signals),
                candle: current
            };

            return signal;
        }

        return null;
    }

    /**
     * 1. Verifica sinal EMA (tendência + toque)
     */
    checkEMASignal(candles, current) {
        const closePrices = candles.map(c => c.close);
        const emaFast = this.calculateEMA(closePrices, this.config.emaFastPeriod);
        const emaSlow = this.calculateEMA(closePrices, this.config.emaSlowPeriod);

        if (!emaFast || !emaSlow) return { signal: false, trend: null };

        const trend = emaFast > emaSlow ? 'up' : 'down';
        
        // Verifica toque na EMA20 (tolerância em pips)
        const pipSize = 0.0001; // para forex 4 casas decimais
        const emaDiffPips = Math.abs(current.close - emaFast) / pipSize;
        const touchingEMA = emaDiffPips <= this.config.emaTouchPips;

        return {
            signal: touchingEMA,
            trend: trend,
            emaFast: emaFast,
            emaSlow: emaSlow
        };
    }

    /**
     * 2. Verifica sinal Fibonacci (retração 50% / 61.8%)
     */
    checkFibonacciSignal(candles, current, trend) {
        const lookback = Math.min(this.config.lookbackImpulse, candles.length - 1);
        const recentCandles = candles.slice(-lookback);

        let highest = -Infinity;
        let lowest = Infinity;

        for (const candle of recentCandles) {
            if (candle.high > highest) highest = candle.high;
            if (candle.low < lowest) lowest = candle.low;
        }

        if (highest <= lowest) return false;

        const range = highest - lowest;
        const pipSize = 0.0001;
        const tolerance = 5 * pipSize;

        if (trend === 'up') {
            // Retração de alta: preço em 50% ou 61.8% acima do mínimo
            const fib50 = lowest + range * 0.5;
            const fib618 = lowest + range * 0.618;

            const nearFib50 = Math.abs(current.close - fib50) <= tolerance;
            const nearFib618 = Math.abs(current.close - fib618) <= tolerance;

            return nearFib50 || nearFib618;
        } else {
            // Retração de baixa: preço em 50% ou 61.8% abaixo do máximo
            const fib50 = highest - range * 0.5;
            const fib618 = highest - range * 0.618;

            const nearFib50 = Math.abs(current.close - fib50) <= tolerance;
            const nearFib618 = Math.abs(current.close - fib618) <= tolerance;

            return nearFib50 || nearFib618;
        }
    }

    /**
     * 3. Verifica sinal RSI + Candle de rejeição
     */
    checkRSICandleSignal(candles, current, trend) {
        const rsi = this.calculateRSI(candles, this.config.rsiPeriod);
        if (!rsi) return false;

        // Calcular pavios do candle
        const body = Math.abs(current.close - current.open);
        const upperWick = current.high - Math.max(current.close, current.open);
        const lowerWick = Math.min(current.close, current.open) - current.low;

        const minBody = 0.00001; // evitar divisão por zero
        const bodySize = Math.max(body, minBody);

        if (trend === 'up') {
            // Candle com pavio inferior grande (rejeição de baixa) + RSI neutro/baixo
            const hasLongLowerWick = lowerWick > (bodySize * this.config.wickFactor / 100);
            const rsiCondition = rsi < 55;
            return hasLongLowerWick && rsiCondition;
        } else {
            // Candle com pavio superior grande (rejeição de alta) + RSI neutro/alto
            const hasLongUpperWick = upperWick > (bodySize * this.config.wickFactor / 100);
            const rsiCondition = rsi > 45;
            return hasLongUpperWick && rsiCondition;
        }
    }

    /**
     * 4. Verifica sinal Bollinger Bands
     */
    checkBollingerSignal(candles, current) {
        const closePrices = candles.map(c => c.close);
        const period = this.config.bbPeriod;
        
        if (closePrices.length < period) return false;

        // Média móvel (SMA)
        const recentPrices = closePrices.slice(-period);
        const sma = recentPrices.reduce((sum, val) => sum + val, 0) / period;

        // Desvio padrão
        const stdDev = this.calculateStdDev(closePrices, period);
        if (!stdDev) return false;

        const upperBand = sma + (this.config.bbDeviation * stdDev);
        const lowerBand = sma - (this.config.bbDeviation * stdDev);

        // Verificar se tocou fora da banda nas últimas 10 barras
        const checkBars = Math.min(10, candles.length - 1);
        let touchedOuter = false;

        for (let i = 1; i <= checkBars; i++) {
            const candle = candles[candles.length - 1 - i];
            if (candle.high > upperBand || candle.low < lowerBand) {
                touchedOuter = true;
                break;
            }
        }

        // Agora retornou próximo da média
        const pipSize = 0.0001;
        const nearSMA = Math.abs(current.close - sma) <= (10 * pipSize);

        return touchedOuter && nearSMA;
    }

    /**
     * Calcula confiança do sinal
     */
    calculateConfidence(confirmedCount, signals) {
        // Base: 40% + 15% por cada sinal confirmado
        let confidence = 40 + (confirmedCount * 15);

        // Bônus se todos os 4 sinais confirmaram
        if (confirmedCount === 4) confidence += 10;

        // Ajustar baseado em qual combinação de sinais
        if (signals.ema && signals.fibonacci) confidence += 5; // EMA + Fib = forte
        if (signals.rsiCandle && signals.bollinger) confidence += 5; // RSI + BB = forte

        return Math.min(confidence, 95);
    }

    /**
     * Analisa os candles e retorna sinal
     */
    analyze(candles) {
        const signal = this.analyzeMultiSignal(candles);

        if (signal && Date.now() - this.lastSignalTime > 60000) { // evitar spam (1 min)
            this.signals.push(signal);
            this.lastSignalTime = Date.now();

            // Enviar notificações
            if (this.config.alertPopup || this.config.alertPush) {
                this.sendNotification(signal);
            }

            if (this.config.alertSound) {
                this.playSound();
            }

            return { newSignal: signal, allSignals: this.signals };
        }

        return { newSignal: null, allSignals: this.signals };
    }

    /**
     * Envia notificação
     */
    sendNotification(signal) {
        const signalsText = Object.entries(signal.signals)
            .map(([key, value]) => `${key}=${value ? '✓' : '✗'}`)
            .join(' ');

        const message = `🎯 Pullback ${signal.type} confirmado!\n` +
                       `Preço: ${signal.price.toFixed(5)}\n` +
                       `Confiança: ${signal.confidence}%\n` +
                       `Sinais: ${signal.confirmedSignals}/4\n` +
                       `${signalsText}`;

        console.log(message);

        if (this.config.alertPopup) {
            alert(message);
        }

        if (this.config.alertPush && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`Pullback MultiSignal ${signal.type}`, {
                body: message,
                icon: 'assets/icon-192.png',
                badge: 'assets/icon-72.png',
                tag: `pullback-multi-${signal.time}`,
                requireInteraction: true
            });
        }

        // Toast visual
        this.showToast(message, signal.type);
    }

    /**
     * Mostra toast notification
     */
    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `pullback-multi-toast pullback-multi-toast-${type.toLowerCase()}`;
        toast.innerHTML = `
            <div class="pullback-multi-toast-icon">${type === 'BUY' ? '📈' : '📉'}</div>
            <div class="pullback-multi-toast-content">
                <strong>Multi-Signal ${type}</strong><br>
                ${message.replace(/\n/g, '<br>')}
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 8000);
    }

    /**
     * Toca som de alerta
     */
    playSound() {
        const audio = new Audio(this.config.soundFile);
        audio.play().catch(err => console.log('Erro ao tocar som:', err));
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
        const avgSignalsConfirmed = this.signals.length > 0
            ? this.signals.reduce((sum, s) => sum + s.confirmedSignals, 0) / this.signals.length
            : 0;

        return {
            totalSignals: this.signals.length,
            buySignals,
            sellSignals,
            averageConfidence: avgConfidence.toFixed(1),
            averageSignalsConfirmed: avgSignalsConfirmed.toFixed(1),
            lastSignal: this.signals[this.signals.length - 1] || null
        };
    }

    /**
     * Reseta o indicador
     */
    reset() {
        this.signals = [];
        this.lastSignalTime = 0;
    }

    /**
     * Atualiza configuração
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Exporta configuração
     */
    getConfig() {
        return { ...this.config };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PullbackMultiSignal = PullbackMultiSignal;
}

// Exportar para Node.js se disponível
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PullbackMultiSignal;
}
