// Trading Signals Generation and Management

class TradingSignals {
    constructor() {
        this.signals = [];
        this.alertsEnabled = true;
        this.signalHistory = Utils.getFromStorage('signalHistory', []);
    }

    // Generate trading signal based on technical analysis
    generateSignal(data, indicators, patterns) {
        if (!data || data.length === 0) return null;

        const currentCandle = data[data.length - 1];
        const signal = {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            pair: 'EURUSD', // This should be dynamic
            timeframe: 'H1',
            price: currentCandle.close,
            type: 'neutral',
            strength: 0,
            confidence: 0,
            reasons: [],
            technicalAnalysis: {
                rsi: indicators.rsi.current,
                macd: indicators.macd.current,
                bollingerPosition: this.getBollingerPosition(currentCandle.close, indicators.bollinger),
                patterns: patterns
            }
        };

        // Analyze each component
        this.analyzeRSI(signal, indicators.rsi);
        this.analyzeMacd(signal, indicators.macd);
        this.analyzeBollinger(signal, currentCandle, indicators.bollinger);
        this.analyzePatterns(signal, patterns);
        this.analyzeStochastic(signal, indicators.stochastic);
        this.analyzeADX(signal, indicators.adx);

        // Calculate overall signal
        this.calculateOverallSignal(signal);

        // Save to history if significant
        if (signal.strength >= 60) {
            this.addToHistory(signal);
        }

        return signal;
    }

    // Analyze RSI for signals
    analyzeRSI(signal, rsi) {
        const value = rsi.current;
        
        if (value >= 70) {
            signal.reasons.push('RSI em sobrecompra (>70)');
            this.addBearishPoints(signal, 15);
        } else if (value <= 30) {
            signal.reasons.push('RSI em sobrevenda (<30)');
            this.addBullishPoints(signal, 15);
        } else if (value >= 60) {
            signal.reasons.push('RSI bullish (>60)');
            this.addBullishPoints(signal, 8);
        } else if (value <= 40) {
            signal.reasons.push('RSI bearish (<40)');
            this.addBearishPoints(signal, 8);
        }
    }

    // Analyze MACD for signals
    analyzeMacd(signal, macd) {
        const macdValue = macd.current;
        const histogram = macd.histogram;
        
        if (macdValue > 0) {
            signal.reasons.push('MACD positivo');
            this.addBullishPoints(signal, 10);
        } else {
            signal.reasons.push('MACD negativo');
            this.addBearishPoints(signal, 10);
        }

        // Check for MACD crossover (simplified)
        if (histogram.length >= 2) {
            const currentHist = histogram[histogram.length - 1];
            const previousHist = histogram[histogram.length - 2];
            
            if (currentHist > 0 && previousHist <= 0) {
                signal.reasons.push('MACD cruzamento bullish');
                this.addBullishPoints(signal, 20);
            } else if (currentHist < 0 && previousHist >= 0) {
                signal.reasons.push('MACD cruzamento bearish');
                this.addBearishPoints(signal, 20);
            }
        }
    }

    // Analyze Bollinger Bands
    analyzeBollinger(signal, candle, bollinger) {
        const { upper, middle, lower } = bollinger.current;
        const price = candle.close;
        
        if (price >= upper) {
            signal.reasons.push('Preço na banda superior');
            this.addBearishPoints(signal, 12);
        } else if (price <= lower) {
            signal.reasons.push('Preço na banda inferior');
            this.addBullishPoints(signal, 12);
        } else if (price > middle) {
            signal.reasons.push('Preço acima da média móvel');
            this.addBullishPoints(signal, 5);
        } else {
            signal.reasons.push('Preço abaixo da média móvel');
            this.addBearishPoints(signal, 5);
        }
    }

    // Analyze candlestick patterns
    analyzePatterns(signal, patterns) {
        patterns.forEach(pattern => {
            const points = this.getPatternPoints(pattern);
            signal.reasons.push(`Padrão: ${pattern.name}`);
            
            if (pattern.type.includes('bullish')) {
                this.addBullishPoints(signal, points);
            } else if (pattern.type.includes('bearish')) {
                this.addBearishPoints(signal, points);
            }
        });
    }

    // Analyze Stochastic Oscillator
    analyzeStochastic(signal, stochastic) {
        const k = stochastic.current.k;
        const d = stochastic.current.d;
        
        if (k >= 80 && d >= 80) {
            signal.reasons.push('Stochastic em sobrecompra');
            this.addBearishPoints(signal, 10);
        } else if (k <= 20 && d <= 20) {
            signal.reasons.push('Stochastic em sobrevenda');
            this.addBullishPoints(signal, 10);
        }

        // Crossover signals
        if (k > d && k > 50) {
            signal.reasons.push('Stochastic cruzamento bullish');
            this.addBullishPoints(signal, 8);
        } else if (k < d && k < 50) {
            signal.reasons.push('Stochastic cruzamento bearish');
            this.addBearishPoints(signal, 8);
        }
    }

    // Analyze ADX for trend strength
    analyzeADX(signal, adx) {
        const value = adx.current;
        
        if (value >= 25) {
            signal.reasons.push('Tendência forte (ADX > 25)');
            signal.confidence += 15;
        } else {
            signal.reasons.push('Tendência fraca (ADX < 25)');
            signal.confidence -= 10;
        }
    }

    // Add bullish points to signal
    addBullishPoints(signal, points) {
        signal.strength += points;
        signal.confidence += points * 0.8;
    }

    // Add bearish points to signal
    addBearishPoints(signal, points) {
        signal.strength -= points;
        signal.confidence += points * 0.8;
    }

    // Get points for pattern based on reliability
    getPatternPoints(pattern) {
        const reliabilityPoints = {
            'high': 25,
            'medium': 15,
            'low': 8
        };
        return reliabilityPoints[pattern.reliability] || 10;
    }

    // Calculate overall signal type and strength
    calculateOverallSignal(signal) {
        // Normalize strength to 0-100 scale
        signal.strength = Math.max(0, Math.min(100, signal.strength + 50));
        signal.confidence = Math.max(0, Math.min(100, signal.confidence));

        // Determine signal type
        if (signal.strength >= 65) {
            signal.type = 'buy';
        } else if (signal.strength <= 35) {
            signal.type = 'sell';
        } else {
            signal.type = 'neutral';
        }

        // Adjust confidence based on number of reasons
        if (signal.reasons.length >= 4) {
            signal.confidence += 10;
        } else if (signal.reasons.length <= 2) {
            signal.confidence -= 15;
        }

        signal.confidence = Math.max(0, Math.min(100, signal.confidence));
    }

    // Get Bollinger Band position
    getBollingerPosition(price, bollinger) {
        const { upper, middle, lower } = bollinger.current;
        
        if (price >= upper) return 'upper';
        if (price <= lower) return 'lower';
        if (price > middle) return 'upper_middle';
        return 'lower_middle';
    }

    // Add signal to history
    addToHistory(signal) {
        this.signalHistory.unshift(signal);
        
        // Keep only last 50 signals
        if (this.signalHistory.length > 50) {
            this.signalHistory = this.signalHistory.slice(0, 50);
        }
        
        Utils.saveToStorage('signalHistory', this.signalHistory);
    }

    // Get recent signals
    getRecentSignals(count = 10) {
        return this.signalHistory.slice(0, count);
    }

    // Filter signals by type
    filterSignals(type = 'all') {
        if (type === 'all') return this.signalHistory;
        return this.signalHistory.filter(signal => signal.type === type);
    }

    // Calculate signal accuracy (mock calculation)
    calculateAccuracy() {
        if (this.signalHistory.length < 10) return 0;
        
        // Simulate accuracy calculation
        const recentSignals = this.signalHistory.slice(0, 20);
        const successful = recentSignals.filter(signal => signal.confidence > 70).length;
        return (successful / recentSignals.length) * 100;
    }

    // Generate alerts for strong signals
    generateAlert(signal) {
        if (!this.alertsEnabled || signal.strength < 70) return;

        const alertMessage = this.formatAlertMessage(signal);
        
        // Show toast notification
        const alertType = signal.type === 'buy' ? 'success' : 
                         signal.type === 'sell' ? 'error' : 'warning';
        
        Utils.showToast(alertMessage, alertType, 5000);

        // Play sound if enabled
        this.playAlertSound();
    }

    // Format alert message
    formatAlertMessage(signal) {
        const action = signal.type === 'buy' ? 'COMPRA' : 
                      signal.type === 'sell' ? 'VENDA' : 'NEUTRO';
        
        return `🚨 SINAL ${action} - ${signal.pair} - Força: ${signal.strength.toFixed(0)}% - Confiança: ${signal.confidence.toFixed(0)}%`;
    }

    // Play alert sound
    playAlertSound() {
        const soundEnabled = Utils.getFromStorage('soundAlerts', false);
        if (!soundEnabled) return;

        // Create audio context and play alert tone
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    // Toggle alerts
    toggleAlerts() {
        this.alertsEnabled = !this.alertsEnabled;
        Utils.saveToStorage('alertsEnabled', this.alertsEnabled);
        return this.alertsEnabled;
    }

    // Get signal statistics
    getStatistics() {
        const total = this.signalHistory.length;
        const buySignals = this.signalHistory.filter(s => s.type === 'buy').length;
        const sellSignals = this.signalHistory.filter(s => s.type === 'sell').length;
        const neutralSignals = this.signalHistory.filter(s => s.type === 'neutral').length;
        
        const avgStrength = total > 0 ? 
            this.signalHistory.reduce((sum, s) => sum + s.strength, 0) / total : 0;
        
        const avgConfidence = total > 0 ? 
            this.signalHistory.reduce((sum, s) => sum + s.confidence, 0) / total : 0;

        return {
            total,
            buySignals,
            sellSignals,
            neutralSignals,
            avgStrength: avgStrength.toFixed(1),
            avgConfidence: avgConfidence.toFixed(1),
            accuracy: this.calculateAccuracy().toFixed(1)
        };
    }

    // Export signals to CSV
    exportSignals() {
        const csvContent = this.signalHistory.map(signal => {
            return [
                Utils.formatDate(signal.timestamp),
                signal.pair,
                signal.type.toUpperCase(),
                signal.strength.toFixed(2),
                signal.confidence.toFixed(2),
                signal.price.toFixed(5),
                signal.reasons.join('; ')
            ].join(',');
        });

        csvContent.unshift('Data,Par,Tipo,Força,Confiança,Preço,Razões');
        
        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `forex_signals_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
window.TradingSignals = TradingSignals;