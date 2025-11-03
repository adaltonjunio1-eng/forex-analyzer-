// Candlestick Pattern Recognition

class CandlestickPatterns {
    // Helper method to determine if a candle is bullish
    static isBullish(candle) {
        return candle.close > candle.open;
    }

    // Helper method to determine if a candle is bearish
    static isBearish(candle) {
        return candle.close < candle.open;
    }

    // Helper method to calculate body size
    static getBodySize(candle) {
        return Math.abs(candle.close - candle.open);
    }

    // Helper method to calculate upper shadow
    static getUpperShadow(candle) {
        return candle.high - Math.max(candle.open, candle.close);
    }

    // Helper method to calculate lower shadow
    static getLowerShadow(candle) {
        return Math.min(candle.open, candle.close) - candle.low;
    }

    // Helper method to calculate total range
    static getTotalRange(candle) {
        return candle.high - candle.low;
    }

    // Helper method to check if candle is a doji
    static isDoji(candle, threshold = 0.1) {
        const bodySize = this.getBodySize(candle);
        const totalRange = this.getTotalRange(candle);
        return totalRange > 0 && (bodySize / totalRange) <= threshold;
    }

    // Helper method to check if candle has long upper shadow
    static hasLongUpperShadow(candle) {
        const upperShadow = this.getUpperShadow(candle);
        const bodySize = this.getBodySize(candle);
        return upperShadow > bodySize * 2;
    }

    // Helper method to check if candle has long lower shadow
    static hasLongLowerShadow(candle) {
        const lowerShadow = this.getLowerShadow(candle);
        const bodySize = this.getBodySize(candle);
        return lowerShadow > bodySize * 2;
    }

    // Doji Pattern
    static detectDoji(candle) {
        if (this.isDoji(candle)) {
            return {
                name: 'Doji',
                type: 'reversal',
                reliability: 'medium',
                description: 'Indecisão do mercado, possível reversão'
            };
        }
        return null;
    }

    // Hammer Pattern
    static detectHammer(candle) {
        const bodySize = this.getBodySize(candle);
        const lowerShadow = this.getLowerShadow(candle);
        const upperShadow = this.getUpperShadow(candle);
        const totalRange = this.getTotalRange(candle);

        if (lowerShadow >= bodySize * 2 && 
            upperShadow <= bodySize * 0.1 && 
            bodySize / totalRange >= 0.1) {
            return {
                name: 'Hammer',
                type: 'bullish_reversal',
                reliability: 'high',
                description: 'Forte sinal de reversão de alta'
            };
        }
        return null;
    }

    // Hanging Man Pattern (similar to hammer but bearish)
    static detectHangingMan(candle) {
        const pattern = this.detectHammer(candle);
        if (pattern) {
            return {
                name: 'Hanging Man',
                type: 'bearish_reversal',
                reliability: 'high',
                description: 'Forte sinal de reversão de baixa'
            };
        }
        return null;
    }

    // Shooting Star Pattern
    static detectShootingStar(candle) {
        const bodySize = this.getBodySize(candle);
        const upperShadow = this.getUpperShadow(candle);
        const lowerShadow = this.getLowerShadow(candle);
        const totalRange = this.getTotalRange(candle);

        if (upperShadow >= bodySize * 2 && 
            lowerShadow <= bodySize * 0.1 && 
            bodySize / totalRange >= 0.1) {
            return {
                name: 'Shooting Star',
                type: 'bearish_reversal',
                reliability: 'high',
                description: 'Sinal de reversão de baixa'
            };
        }
        return null;
    }

    // Inverted Hammer Pattern
    static detectInvertedHammer(candle) {
        const pattern = this.detectShootingStar(candle);
        if (pattern) {
            return {
                name: 'Inverted Hammer',
                type: 'bullish_reversal',
                reliability: 'medium',
                description: 'Possível reversão de alta'
            };
        }
        return null;
    }

    // Spinning Top Pattern
    static detectSpinningTop(candle) {
        const bodySize = this.getBodySize(candle);
        const upperShadow = this.getUpperShadow(candle);
        const lowerShadow = this.getLowerShadow(candle);
        const totalRange = this.getTotalRange(candle);

        if (bodySize / totalRange <= 0.3 && 
            upperShadow >= bodySize && 
            lowerShadow >= bodySize) {
            return {
                name: 'Spinning Top',
                type: 'indecision',
                reliability: 'low',
                description: 'Indecisão do mercado'
            };
        }
        return null;
    }

    // Marubozu Pattern (no shadows)
    static detectMarubozu(candle) {
        const upperShadow = this.getUpperShadow(candle);
        const lowerShadow = this.getLowerShadow(candle);
        const totalRange = this.getTotalRange(candle);

        if (upperShadow / totalRange <= 0.01 && lowerShadow / totalRange <= 0.01) {
            const type = this.isBullish(candle) ? 'bullish_continuation' : 'bearish_continuation';
            return {
                name: 'Marubozu',
                type: type,
                reliability: 'high',
                description: 'Forte continuação da tendência'
            };
        }
        return null;
    }

    // Engulfing Pattern (requires 2 candles)
    static detectEngulfing(candle1, candle2) {
        const bullishEngulfing = this.isBearish(candle1) && 
                                this.isBullish(candle2) && 
                                candle2.open < candle1.close && 
                                candle2.close > candle1.open;

        const bearishEngulfing = this.isBullish(candle1) && 
                                this.isBearish(candle2) && 
                                candle2.open > candle1.close && 
                                candle2.close < candle1.open;

        if (bullishEngulfing) {
            return {
                name: 'Bullish Engulfing',
                type: 'bullish_reversal',
                reliability: 'high',
                description: 'Forte reversão de alta'
            };
        }

        if (bearishEngulfing) {
            return {
                name: 'Bearish Engulfing',
                type: 'bearish_reversal',
                reliability: 'high',
                description: 'Forte reversão de baixa'
            };
        }

        return null;
    }

    // Harami Pattern (requires 2 candles)
    static detectHarami(candle1, candle2) {
        const bodySize1 = this.getBodySize(candle1);
        const bodySize2 = this.getBodySize(candle2);

        const bullishHarami = this.isBearish(candle1) && 
                             this.isBullish(candle2) && 
                             candle2.open > candle1.close && 
                             candle2.close < candle1.open && 
                             bodySize2 < bodySize1;

        const bearishHarami = this.isBullish(candle1) && 
                             this.isBearish(candle2) && 
                             candle2.open < candle1.close && 
                             candle2.close > candle1.open && 
                             bodySize2 < bodySize1;

        if (bullishHarami) {
            return {
                name: 'Bullish Harami',
                type: 'bullish_reversal',
                reliability: 'medium',
                description: 'Possível reversão de alta'
            };
        }

        if (bearishHarami) {
            return {
                name: 'Bearish Harami',
                type: 'bearish_reversal',
                reliability: 'medium',
                description: 'Possível reversão de baixa'
            };
        }

        return null;
    }

    // Piercing Line Pattern (requires 2 candles)
    static detectPiercingLine(candle1, candle2) {
        if (this.isBearish(candle1) && this.isBullish(candle2)) {
            const midpoint = (candle1.open + candle1.close) / 2;
            if (candle2.open < candle1.close && candle2.close > midpoint && candle2.close < candle1.open) {
                return {
                    name: 'Piercing Line',
                    type: 'bullish_reversal',
                    reliability: 'medium',
                    description: 'Sinal de reversão de alta'
                };
            }
        }
        return null;
    }

    // Dark Cloud Cover Pattern (requires 2 candles)
    static detectDarkCloudCover(candle1, candle2) {
        if (this.isBullish(candle1) && this.isBearish(candle2)) {
            const midpoint = (candle1.open + candle1.close) / 2;
            if (candle2.open > candle1.close && candle2.close < midpoint && candle2.close > candle1.open) {
                return {
                    name: 'Dark Cloud Cover',
                    type: 'bearish_reversal',
                    reliability: 'medium',
                    description: 'Sinal de reversão de baixa'
                };
            }
        }
        return null;
    }

    // Three White Soldiers Pattern (requires 3 candles)
    static detectThreeWhiteSoldiers(candle1, candle2, candle3) {
        const allBullish = this.isBullish(candle1) && this.isBullish(candle2) && this.isBullish(candle3);
        const consecutive = candle2.open > candle1.open && candle2.close > candle1.close &&
                           candle3.open > candle2.open && candle3.close > candle2.close;

        if (allBullish && consecutive) {
            return {
                name: 'Three White Soldiers',
                type: 'bullish_continuation',
                reliability: 'high',
                description: 'Forte continuação de alta'
            };
        }
        return null;
    }

    // Three Black Crows Pattern (requires 3 candles)
    static detectThreeBlackCrows(candle1, candle2, candle3) {
        const allBearish = this.isBearish(candle1) && this.isBearish(candle2) && this.isBearish(candle3);
        const consecutive = candle2.open < candle1.open && candle2.close < candle1.close &&
                           candle3.open < candle2.open && candle3.close < candle2.close;

        if (allBearish && consecutive) {
            return {
                name: 'Three Black Crows',
                type: 'bearish_continuation',
                reliability: 'high',
                description: 'Forte continuação de baixa'
            };
        }
        return null;
    }

    // Main method to detect all patterns
    static detectPatterns(data) {
        if (data.length < 1) return [];

        const patterns = [];
        const currentCandle = data[data.length - 1];

        // Single candle patterns
        const singlePatterns = [
            this.detectDoji(currentCandle),
            this.detectHammer(currentCandle),
            this.detectShootingStar(currentCandle),
            this.detectSpinningTop(currentCandle),
            this.detectMarubozu(currentCandle)
        ].filter(pattern => pattern !== null);

        patterns.push(...singlePatterns);

        // Two candle patterns
        if (data.length >= 2) {
            const previousCandle = data[data.length - 2];
            const twoPatterns = [
                this.detectEngulfing(previousCandle, currentCandle),
                this.detectHarami(previousCandle, currentCandle),
                this.detectPiercingLine(previousCandle, currentCandle),
                this.detectDarkCloudCover(previousCandle, currentCandle)
            ].filter(pattern => pattern !== null);

            patterns.push(...twoPatterns);
        }

        // Three candle patterns
        if (data.length >= 3) {
            const candle1 = data[data.length - 3];
            const candle2 = data[data.length - 2];
            const candle3 = data[data.length - 1];

            const threePatterns = [
                this.detectThreeWhiteSoldiers(candle1, candle2, candle3),
                this.detectThreeBlackCrows(candle1, candle2, candle3)
            ].filter(pattern => pattern !== null);

            patterns.push(...threePatterns);
        }

        return patterns;
    }

    // Calculate pattern strength based on volume and context
    static calculatePatternStrength(pattern, candle, volume = 1000) {
        let strength = 50; // Base strength

        // Reliability modifier
        const reliabilityModifier = {
            'high': 20,
            'medium': 10,
            'low': 0
        };
        strength += reliabilityModifier[pattern.reliability] || 0;

        // Volume modifier (assuming higher volume = stronger signal)
        if (volume > 5000) strength += 15;
        else if (volume > 2000) strength += 10;
        else if (volume > 1000) strength += 5;

        // Range modifier (larger candles = stronger signals)
        const range = this.getTotalRange(candle);
        if (range > 0.002) strength += 10;
        else if (range > 0.001) strength += 5;

        // Cap strength between 0 and 100
        return Math.max(0, Math.min(100, strength));
    }

    // Get pattern color for UI display
    static getPatternColor(pattern) {
        const colorMap = {
            'bullish_reversal': '#00ff88',
            'bearish_reversal': '#ff4757',
            'bullish_continuation': '#3bb143',
            'bearish_continuation': '#e74c3c',
            'indecision': '#ffa502',
            'reversal': '#f39c12'
        };
        return colorMap[pattern.type] || '#6c757d';
    }

    // Get pattern icon for UI display
    static getPatternIcon(pattern) {
        const iconMap = {
            'bullish_reversal': 'fas fa-arrow-up',
            'bearish_reversal': 'fas fa-arrow-down',
            'bullish_continuation': 'fas fa-trending-up',
            'bearish_continuation': 'fas fa-trending-down',
            'indecision': 'fas fa-question',
            'reversal': 'fas fa-exchange-alt'
        };
        return iconMap[pattern.type] || 'fas fa-chart-line';
    }
}

// Export for use in other modules
window.CandlestickPatterns = CandlestickPatterns;