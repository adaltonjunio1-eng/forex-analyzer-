// Utility functions for the Forex Candle Analyzer

class Utils {
    // Format currency values
    static formatCurrency(value, decimals = 4) {
        return parseFloat(value).toFixed(decimals);
    }

    // Format percentage values
    static formatPercentage(value, decimals = 2) {
        return `${parseFloat(value).toFixed(decimals)}%`;
    }

    // Format timestamp to readable date
    static formatDate(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    // Generate random number between min and max
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Calculate percentage change
    static percentageChange(oldValue, newValue) {
        return ((newValue - oldValue) / oldValue) * 100;
    }

    // Debounce function for API calls
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Generate mock forex data
    static generateMockData(count = 100, basePrice = 1.0850) {
        const data = [];
        let currentPrice = basePrice;
        const now = Date.now();
        
        for (let i = count; i >= 0; i--) {
            const timestamp = now - (i * 60000); // 1 minute intervals
            const change = this.randomBetween(-0.002, 0.002);
            currentPrice += change;
            
            const open = currentPrice;
            const high = open + this.randomBetween(0, 0.001);
            const low = open - this.randomBetween(0, 0.001);
            const close = this.randomBetween(low, high);
            const volume = this.randomBetween(1000, 10000);
            
            data.push({
                timestamp,
                open: parseFloat(open.toFixed(5)),
                high: parseFloat(high.toFixed(5)),
                low: parseFloat(low.toFixed(5)),
                close: parseFloat(close.toFixed(5)),
                volume: Math.round(volume)
            });
            
            currentPrice = close;
        }
        
        return data;
    }

    // Show loading overlay
    static showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    // Hide loading overlay
    static hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Show toast notification
    static showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    }

    // Get appropriate icon for toast type
    static getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Local storage helpers
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    // Color helpers for charts
    static getColorByValue(value, thresholds = { low: 30, high: 70 }) {
        if (value <= thresholds.low) return '#ff4757'; // Red
        if (value >= thresholds.high) return '#00ff88'; // Green
        return '#ffa502'; // Yellow
    }

    // Validate currency pair
    static isValidCurrencyPair(pair) {
        const validPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP'];
        return validPairs.includes(pair.toUpperCase());
    }

    // Calculate candle body percentage
    static calculateCandleBody(candle) {
        const { open, close, high, low } = candle;
        const totalRange = high - low;
        const bodySize = Math.abs(close - open);
        return totalRange > 0 ? (bodySize / totalRange) * 100 : 0;
    }

    // Determine candle type
    static getCandleType(candle) {
        const { open, close } = candle;
        if (close > open) return 'bullish';
        if (close < open) return 'bearish';
        return 'doji';
    }

    // Calculate average true range (ATR)
    static calculateATR(data, period = 14) {
        if (data.length < period + 1) return 0;

        const trueRanges = [];
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            
            const tr1 = current.high - current.low;
            const tr2 = Math.abs(current.high - previous.close);
            const tr3 = Math.abs(current.low - previous.close);
            
            trueRanges.push(Math.max(tr1, tr2, tr3));
        }

        // Calculate SMA of true ranges
        const recentTR = trueRanges.slice(-period);
        return recentTR.reduce((sum, tr) => sum + tr, 0) / period;
    }

    // Format time ago
    static timeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}min atrás`;
        return 'Agora';
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if device is mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Animate number counting
    static animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = this.formatCurrency(current);
        }, 16);
    }
}

// Export for use in other modules
window.Utils = Utils;