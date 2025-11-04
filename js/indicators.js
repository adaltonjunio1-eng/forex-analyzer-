// Technical Indicators for Forex Analysis

class TechnicalIndicators {
    // Calculate Simple Moving Average (SMA)
    static calculateSMA(data, period) {
        if (data.length < period) return [];
        
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1)
                .reduce((acc, candle) => acc + candle.close, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    // Calculate Exponential Moving Average (EMA)
    static calculateEMA(data, period) {
        if (data.length < period) return [];
        
        const k = 2 / (period + 1);
        const ema = [data[0].close];
        
        for (let i = 1; i < data.length; i++) {
            const value = data[i].close * k + ema[i - 1] * (1 - k);
            ema.push(value);
        }
        
        return ema.slice(period - 1);
    }

    // Calculate Relative Strength Index (RSI)
    static calculateRSI(data, period = 14) {
        if (data.length < period + 1) return { values: [], current: 50 };
        
        const gains = [];
        const losses = [];
        
        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const rsiValues = [];
        
        // Calculate initial average gain and loss
        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
        
        // Calculate RSI for initial period
        let rs = avgGain / (avgLoss || 0.0001);
        rsiValues.push(100 - (100 / (1 + rs)));
        
        // Calculate RSI for remaining periods using smoothed averages
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            rs = avgGain / (avgLoss || 0.0001);
            rsiValues.push(100 - (100 / (1 + rs)));
        }
        
        return {
            values: rsiValues,
            current: rsiValues[rsiValues.length - 1] || 50
        };
    }

    // Calculate MACD (Moving Average Convergence Divergence)
    static calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (data.length < slowPeriod) {
            return { macd: [], signal: [], histogram: [], current: 0 };
        }
        
        const fastEMA = this.calculateEMA(data, fastPeriod);
        const slowEMA = this.calculateEMA(data, slowPeriod);
        
        // Align arrays (slow EMA is shorter)
        const alignedFastEMA = fastEMA.slice(slowPeriod - fastPeriod);
        
        // Calculate MACD line
        const macdLine = [];
        for (let i = 0; i < Math.min(alignedFastEMA.length, slowEMA.length); i++) {
            macdLine.push(alignedFastEMA[i] - slowEMA[i]);
        }
        
        // Calculate signal line (EMA of MACD)
        const signalData = macdLine.map(value => ({ close: value }));
        const signalLine = this.calculateEMA(signalData, signalPeriod);
        
        // Calculate histogram
        const histogram = [];
        const alignedMacd = macdLine.slice(signalPeriod - 1);
        for (let i = 0; i < Math.min(alignedMacd.length, signalLine.length); i++) {
            histogram.push(alignedMacd[i] - signalLine[i]);
        }
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram,
            current: macdLine[macdLine.length - 1] || 0
        };
    }

    // Calculate Bollinger Bands
    static calculateBollingerBands(data, period = 20, stdDev = 2) {
        if (data.length < period) {
            return { upper: [], middle: [], lower: [], current: { upper: 0, middle: 0, lower: 0 } };
        }
        
        const sma = this.calculateSMA(data, period);
        const upper = [];
        const lower = [];
        
        for (let i = 0; i < sma.length; i++) {
            const dataSlice = data.slice(i, i + period);
            const mean = sma[i];
            
            // Calculate standard deviation
            const squaredDiffs = dataSlice.map(candle => Math.pow(candle.close - mean, 2));
            const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            upper.push(mean + (standardDeviation * stdDev));
            lower.push(mean - (standardDeviation * stdDev));
        }
        
        return {
            upper: upper,
            middle: sma,
            lower: lower,
            current: {
                upper: upper[upper.length - 1] || 0,
                middle: sma[sma.length - 1] || 0,
                lower: lower[lower.length - 1] || 0
            }
        };
    }

    // Calculate Stochastic Oscillator
    static calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
        if (data.length < kPeriod) {
            return { k: [], d: [], current: { k: 50, d: 50 } };
        }
        
        const kValues = [];
        
        for (let i = kPeriod - 1; i < data.length; i++) {
            const slice = data.slice(i - kPeriod + 1, i + 1);
            const highest = Math.max(...slice.map(candle => candle.high));
            const lowest = Math.min(...slice.map(candle => candle.low));
            const current = data[i].close;
            
            const k = ((current - lowest) / (highest - lowest)) * 100;
            kValues.push(k);
        }
        
        // Calculate %D (SMA of %K)
        const dValues = [];
        for (let i = dPeriod - 1; i < kValues.length; i++) {
            const sum = kValues.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val, 0);
            dValues.push(sum / dPeriod);
        }
        
        return {
            k: kValues,
            d: dValues,
            current: {
                k: kValues[kValues.length - 1] || 50,
                d: dValues[dValues.length - 1] || 50
            }
        };
    }

    // Calculate Williams %R
    static calculateWilliamsR(data, period = 14) {
        if (data.length < period) return { values: [], current: -50 };
        
        const values = [];
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const highest = Math.max(...slice.map(candle => candle.high));
            const lowest = Math.min(...slice.map(candle => candle.low));
            const current = data[i].close;
            
            const williamsR = ((highest - current) / (highest - lowest)) * -100;
            values.push(williamsR);
        }
        
        return {
            values: values,
            current: values[values.length - 1] || -50
        };
    }

    // Calculate Average Directional Index (ADX)
    static calculateADX(data, period = 14) {
        if (data.length < period + 1) {
            return { adx: [], di_plus: [], di_minus: [], current: 25 };
        }
        
        const trueRanges = [];
        const dmPlus = [];
        const dmMinus = [];
        
        // Calculate True Range and Directional Movement
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            
            // True Range
            const tr1 = current.high - current.low;
            const tr2 = Math.abs(current.high - previous.close);
            const tr3 = Math.abs(current.low - previous.close);
            trueRanges.push(Math.max(tr1, tr2, tr3));
            
            // Directional Movement
            const highDiff = current.high - previous.high;
            const lowDiff = previous.low - current.low;
            
            dmPlus.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
            dmMinus.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
        }
        
        // Calculate smoothed averages
        const smoothedTR = this.calculateSMA(trueRanges.map(tr => ({ close: tr })), period);
        const smoothedDMPlus = this.calculateSMA(dmPlus.map(dm => ({ close: dm })), period);
        const smoothedDMMinus = this.calculateSMA(dmMinus.map(dm => ({ close: dm })), period);
        
        // Calculate DI+ and DI-
        const diPlus = [];
        const diMinus = [];
        const dx = [];
        
        for (let i = 0; i < smoothedTR.length; i++) {
            const diPlusValue = (smoothedDMPlus[i] / smoothedTR[i]) * 100;
            const diMinusValue = (smoothedDMMinus[i] / smoothedTR[i]) * 100;
            
            diPlus.push(diPlusValue);
            diMinus.push(diMinusValue);
            
            // Calculate DX
            const diDiff = Math.abs(diPlusValue - diMinusValue);
            const diSum = diPlusValue + diMinusValue;
            dx.push(diSum !== 0 ? (diDiff / diSum) * 100 : 0);
        }
        
        // Calculate ADX (smoothed DX)
        const adx = this.calculateSMA(dx.map(value => ({ close: value })), period);
        
        return {
            adx: adx,
            di_plus: diPlus,
            di_minus: diMinus,
            current: adx[adx.length - 1] || 25
        };
    }

    // Calculate Commodity Channel Index (CCI)
    static calculateCCI(data, period = 20) {
        if (data.length < period) return { values: [], current: 0 };
        
        const typicalPrices = data.map(candle => (candle.high + candle.low + candle.close) / 3);
        const sma = this.calculateSMA(typicalPrices.map(tp => ({ close: tp })), period);
        const cciValues = [];
        
        for (let i = 0; i < sma.length; i++) {
            const slice = typicalPrices.slice(i, i + period);
            const mean = sma[i];
            
            // Calculate mean deviation
            const meanDeviation = slice.reduce((sum, tp) => sum + Math.abs(tp - mean), 0) / period;
            
            const cci = meanDeviation !== 0 ? (typicalPrices[i + period - 1] - mean) / (0.015 * meanDeviation) : 0;
            cciValues.push(cci);
        }
        
        return {
            values: cciValues,
            current: cciValues[cciValues.length - 1] || 0
        };
    }

    // Calculate all indicators for current data
    static calculateAllIndicators(data) {
        const rsi = this.calculateRSI(data);
        const macd = this.calculateMACD(data);
        const bollinger = this.calculateBollingerBands(data);
        const stochastic = this.calculateStochastic(data);
        const williamsR = this.calculateWilliamsR(data);
        const adx = this.calculateADX(data);
        const cci = this.calculateCCI(data);
        
        return {
            rsi,
            macd,
            bollinger,
            stochastic,
            williamsR,
            adx,
            cci
        };
    }

    // Determine overall trend based on indicators
    static determineTrend(indicators) {
        const { rsi, macd, stochastic, adx } = indicators;
        
        let bullishSignals = 0;
        let bearishSignals = 0;
        
        // RSI signals
        if (rsi.current > 50) bullishSignals++;
        else bearishSignals++;
        
        // MACD signals
        if (macd.current > 0) bullishSignals++;
        else bearishSignals++;
        
        // Stochastic signals
        if (stochastic.current.k > 50) bullishSignals++;
        else bearishSignals++;
        
        // ADX strength
        const trendStrength = adx.current > 25 ? 'strong' : 'weak';
        
        if (bullishSignals > bearishSignals) {
            return { direction: 'bullish', strength: trendStrength };
        } else if (bearishSignals > bullishSignals) {
            return { direction: 'bearish', strength: trendStrength };
        } else {
            return { direction: 'neutral', strength: 'weak' };
        }
    }
}

// RSI Divergence Detection System
class RSIDivergenceDetector {
    constructor(options = {}) {
        this.useRSIDivergence = options.useRSIDivergence || true;
        this.divergenceLookback = options.lookback || 10;
        this.minDivergenceStrength = options.minStrength || 2.0;
        this.divergencePoints = [];
        this.lastDivergenceCheck = 0;
    }

    // Find pivot points in RSI
    findRSIPivotPoints(rsiData, priceData, lookback) {
        const bullishPivots = [];
        const bearishPivots = [];
        
        if (rsiData.length < lookback) return { bullishPivots, bearishPivots };
        
        // Find bottoms (bullish divergence potential)
        for (let i = 3; i < lookback - 3; i++) {
            if (rsiData[i] < rsiData[i-1] && rsiData[i] < rsiData[i-2] && 
                rsiData[i] < rsiData[i+1] && rsiData[i] < rsiData[i+2] &&
                rsiData[i] < 50.0) { // Only bottoms below middle line
                bullishPivots.push({
                    index: i,
                    rsi: rsiData[i],
                    price: priceData[i],
                    type: 'bottom'
                });
            }
        }
        
        // Find tops (bearish divergence potential)
        for (let i = 3; i < lookback - 3; i++) {
            if (rsiData[i] > rsiData[i-1] && rsiData[i] > rsiData[i-2] && 
                rsiData[i] > rsiData[i+1] && rsiData[i] > rsiData[i+2] &&
                rsiData[i] > 50.0) { // Only tops above middle line
                bearishPivots.push({
                    index: i,
                    rsi: rsiData[i],
                    price: priceData[i],
                    type: 'top'
                });
            }
        }
        
        return { bullishPivots, bearishPivots };
    }

    // Detect regular RSI divergence
    detectRegularDivergence(rsiData, priceData) {
        if (!this.useRSIDivergence || rsiData.length < this.divergenceLookback) {
            return { type: null, strength: 0, description: 'No divergence' };
        }
        
        const lookback = Math.min(this.divergenceLookback, rsiData.length);
        const { bullishPivots, bearishPivots } = this.findRSIPivotPoints(
            rsiData.slice(-lookback), 
            priceData.slice(-lookback), 
            lookback
        );
        
        // Check bullish divergence (bottom)
        if (bullishPivots.length >= 2) {
            const last = bullishPivots[bullishPivots.length - 1];
            const prev = bullishPivots[bullishPivots.length - 2];
            
            // Price makes lower low, RSI makes higher low
            if (last.price < prev.price && last.rsi > prev.rsi) {
                const strength = Math.abs((last.rsi - prev.rsi) / (prev.price - last.price));
                if (strength >= this.minDivergenceStrength) {
                    return {
                        type: 'bullish_regular',
                        strength: strength,
                        description: 'Regular Bullish Divergence',
                        signal: 'buy',
                        confidence: this.calculateConfidence(strength),
                        points: { last, prev }
                    };
                }
            }
        }
        
        // Check bearish divergence (top)
        if (bearishPivots.length >= 2) {
            const last = bearishPivots[bearishPivots.length - 1];
            const prev = bearishPivots[bearishPivots.length - 2];
            
            // Price makes higher high, RSI makes lower high
            if (last.price > prev.price && last.rsi < prev.rsi) {
                const strength = Math.abs((prev.rsi - last.rsi) / (last.price - prev.price));
                if (strength >= this.minDivergenceStrength) {
                    return {
                        type: 'bearish_regular',
                        strength: strength,
                        description: 'Regular Bearish Divergence',
                        signal: 'sell',
                        confidence: this.calculateConfidence(strength),
                        points: { last, prev }
                    };
                }
            }
        }
        
        return { type: null, strength: 0, description: 'No regular divergence' };
    }

    // Detect hidden RSI divergence
    detectHiddenDivergence(rsiData, priceData) {
        if (!this.useRSIDivergence || rsiData.length < this.divergenceLookback) {
            return { type: null, strength: 0, description: 'No hidden divergence' };
        }
        
        const lookback = Math.min(this.divergenceLookback, rsiData.length);
        const { bullishPivots, bearishPivots } = this.findRSIPivotPoints(
            rsiData.slice(-lookback), 
            priceData.slice(-lookback), 
            lookback
        );
        
        // Hidden bullish divergence
        if (bullishPivots.length >= 2) {
            const last = bullishPivots[bullishPivots.length - 1];
            const prev = bullishPivots[bullishPivots.length - 2];
            
            // Price makes higher low, RSI makes lower low
            if (last.price > prev.price && last.rsi < prev.rsi) {
                return {
                    type: 'bullish_hidden',
                    strength: 1.5, // Hidden divergences are continuation signals
                    description: 'Hidden Bullish Divergence',
                    signal: 'buy',
                    confidence: 'medium',
                    points: { last, prev }
                };
            }
        }
        
        // Hidden bearish divergence
        if (bearishPivots.length >= 2) {
            const last = bearishPivots[bearishPivots.length - 1];
            const prev = bearishPivots[bearishPivots.length - 2];
            
            // Price makes lower high, RSI makes higher high
            if (last.price < prev.price && last.rsi > prev.rsi) {
                return {
                    type: 'bearish_hidden',
                    strength: 1.5,
                    description: 'Hidden Bearish Divergence',
                    signal: 'sell',
                    confidence: 'medium',
                    points: { last, prev }
                };
            }
        }
        
        return { type: null, strength: 0, description: 'No hidden divergence' };
    }

    // Calculate confidence level based on strength
    calculateConfidence(strength) {
        if (strength >= 4.0) return 'very_high';
        if (strength >= 3.0) return 'high';
        if (strength >= 2.0) return 'medium';
        return 'low';
    }

    // Main function to check all divergences
    checkAllDivergences(rsiData, priceData) {
        const regular = this.detectRegularDivergence(rsiData, priceData);
        const hidden = this.detectHiddenDivergence(rsiData, priceData);
        
        // Priority to regular divergence
        if (regular.type) return regular;
        if (hidden.type) return hidden;
        
        return { type: null, strength: 0, description: 'No divergence detected' };
    }

    // Get divergence summary for UI
    getDivergenceSummary(rsiData, priceData) {
        const divergence = this.checkAllDivergences(rsiData, priceData);
        
        return {
            hasDiv: divergence.type !== null,
            type: divergence.type,
            signal: divergence.signal || 'neutral',
            strength: divergence.strength || 0,
            confidence: divergence.confidence || 'none',
            description: divergence.description,
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
window.TechnicalIndicators = TechnicalIndicators;