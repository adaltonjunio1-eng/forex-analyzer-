// Main Application Controller

class ForexApp {
    constructor() {
        console.log('🏗️ ForexApp constructor called');
        this.currentPair = 'EURUSD';
        this.currentTimeframe = 'H1';
        this.data = [];
        this.indicators = {};
        this.patterns = [];
        this.chart = null;
        this.volumeChart = null;
        this.signalsManager = new TradingSignals();
        this.newsAnalyzer = new NewsSentimentAnalyzer();
        this.newsData = [];
        this.pullbackIndicator = new PullbackIndicator({
            emaFast: 20,
            emaSlow: 50,
            atrPeriod: 14,
            atrMinMult: 0.2,
            enablePush: true,
            arrowOffset: 10,
            maxLevels: 5,
            timeframe: 'M15'
        });
        this.pullbackData = {
            levels: [],
            signals: [],
            lastAnalysis: null
        };
        this.autoRefresh = true;
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;

        console.log('⚙️ ForexApp properties initialized');
        this.init();
    }

    // Initialize the application
    init() {
        console.log('🔧 Starting ForexApp initialization...');
        this.initializeCharts();
        this.bindEvents();
        this.loadSettings();
        this.generateInitialData();
        this.startAutoRefresh();
        this.updateUI();
        console.log('✅ ForexApp initialization completed');
    }

    // Initialize chart instances
    initializeCharts() {
        try {
            const forexCanvas = document.getElementById('forexChart');
            const volumeCanvas = document.getElementById('volumeChart');
            
            if (forexCanvas) {
                this.chart = new ForexChart('forexChart');
                console.log('Forex chart initialized successfully');
            } else {
                console.error('Forex chart canvas not found');
            }
            
            if (volumeCanvas) {
                this.volumeChart = new VolumeChart('volumeChart');
                console.log('Volume chart initialized successfully');
            } else {
                console.log('Volume chart canvas not found - this is optional');
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
            Utils.showToast('Erro ao inicializar gráficos', 'error');
        }
    }

    // Bind event listeners
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Currency pair selection
        const currencySelect = document.getElementById('currencyPair');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.currentPair = e.target.value;
                this.analyzeMarket();
            });
        }

        // Timeframe selection
        const timeframeSelect = document.getElementById('timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.currentTimeframe = e.target.value;
                this.chart.setTimeframe(e.target.value);
                this.analyzeMarket();
            });
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                console.log('🔍 Analyze button clicked!');
                this.analyzeMarket(true);
            });
            console.log('✅ Analyze button event listener added');
        } else {
            console.error('❌ Analyze button not found in DOM');
        }

        // Signal filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterSignals(e.target.dataset.filter);
                this.updateFilterButtons(e.target);
            });
        });

        // Alerts toggle
        const alertsToggle = document.getElementById('alertsToggle');
        if (alertsToggle) {
            alertsToggle.addEventListener('click', () => {
                this.toggleAlerts();
            });
        }

        // Settings
        this.bindSettingsEvents();
        
        // News events
        this.bindNewsEvents();
    }

    // Bind news events
    bindNewsEvents() {
        // News filters
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sentiment = e.currentTarget.dataset.sentiment;
                this.filterNews(sentiment);
                this.updateNewsFilterButtons(e.currentTarget);
            });
        });

        // Refresh news button
        const refreshNewsBtn = document.getElementById('refreshNews');
        if (refreshNewsBtn) {
            refreshNewsBtn.addEventListener('click', () => {
                this.loadNews();
                Utils.showToast('Notícias atualizadas!', 'success');
            });
        }

        // Auto-refresh toggle
        const autoRefreshNews = document.getElementById('autoRefreshNews');
        if (autoRefreshNews) {
            autoRefreshNews.addEventListener('change', (e) => {
                this.newsAutoRefresh = e.target.checked;
                if (this.newsAutoRefresh) {
                    this.startNewsAutoRefresh();
                } else {
                    this.stopNewsAutoRefresh();
                }
            });
        }
    }

    // Bind settings events
    bindSettingsEvents() {
        const autoRefreshToggle = document.getElementById('autoRefresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                this.toggleAutoRefresh();
            });
        }

        const refreshInterval = document.getElementById('refreshInterval');
        if (refreshInterval) {
            refreshInterval.addEventListener('change', (e) => {
                this.refreshInterval = parseInt(e.target.value) * 1000;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                }
            });
        }

        const chartType = document.getElementById('chartType');
        if (chartType) {
            chartType.addEventListener('change', (e) => {
                this.chart.setChartType(e.target.value);
            });
        }

        // Indicator settings
        const rsiPeriod = document.getElementById('rsiPeriod');
        if (rsiPeriod) {
            rsiPeriod.addEventListener('change', () => {
                this.analyzeMarket();
            });
        }
    }

    // Load settings from localStorage
    loadSettings() {
        this.autoRefresh = Utils.getFromStorage('autoRefresh', true);
        this.refreshInterval = Utils.getFromStorage('refreshInterval', 30) * 1000;
        
        // Update UI elements
        const autoRefreshEl = document.getElementById('autoRefresh');
        if (autoRefreshEl) autoRefreshEl.checked = this.autoRefresh;
        
        const refreshIntervalEl = document.getElementById('refreshInterval');
        if (refreshIntervalEl) refreshIntervalEl.value = this.refreshInterval / 1000;
    }

    // Save settings to localStorage
    saveSettings() {
        Utils.saveToStorage('autoRefresh', this.autoRefresh);
        Utils.saveToStorage('refreshInterval', this.refreshInterval / 1000);
    }

    // Generate initial mock data
    generateInitialData() {
        this.data = Utils.generateMockData(100);
        this.analyzeMarket();
    }

    // Navigate to different sections
    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.classList.toggle('active');
        }
    }

    // Analyze market data
    analyzeMarket(showLoading = false) {
        if (showLoading) {
            Utils.showLoading();
        }

        // Simulate API delay
        setTimeout(() => {
            try {
                console.log('Starting market analysis...');
                console.log('Data length:', this.data.length);
                
                // Calculate technical indicators
                this.indicators = TechnicalIndicators.calculateAllIndicators(this.data);
                console.log('Indicators calculated:', Object.keys(this.indicators));
                
                // Detect candlestick patterns
                this.patterns = CandlestickPatterns.detectPatterns(this.data);
                console.log('Patterns detected:', this.patterns.length);
                
                // Generate trading signal
                const signal = this.signalsManager.generateSignal(this.data, this.indicators, this.patterns);
                console.log('Signal generated:', signal ? signal.type : 'none');
                
                // Update charts
                if (this.chart) {
                    this.chart.updateChart(this.data, this.indicators);
                    console.log('Main chart updated');
                } else {
                    console.error('Main chart not available');
                }
                
                if (this.volumeChart) {
                    this.volumeChart.updateChart(this.data.slice(-20)); // Show last 20 candles
                    console.log('Volume chart updated');
                }
                
                // Update UI
                this.updateDashboard();
                this.updateAnalysisSection();
                this.updateSignalsSection();
                console.log('UI updated');
                
                // Cache data for offline use (only if online)
                if (!this.isOffline && navigator.onLine) {
                    this.cacheCurrentData();
                }
                
                // Generate alert if strong signal
                if (signal) {
                    this.signalsManager.generateAlert(signal);
                }
                
                // Add new data for next cycle (simulate real-time)
                this.addNewCandle();
                
                Utils.showToast('Análise concluída', 'success');
                
            } catch (error) {
                console.error('Error analyzing market:', error);
                Utils.showToast('Erro na análise', 'error');
            } finally {
                Utils.hideLoading();
            }
        }, 1000);
    }

    // Add new candle (simulate real-time data)
    addNewCandle() {
        const lastCandle = this.data[this.data.length - 1];
        const newCandle = {
            timestamp: lastCandle.timestamp + 60000, // 1 minute later
            open: lastCandle.close,
            high: lastCandle.close + Utils.randomBetween(0, 0.001),
            low: lastCandle.close - Utils.randomBetween(0, 0.001),
            close: lastCandle.close + Utils.randomBetween(-0.0005, 0.0005),
            volume: Math.round(Utils.randomBetween(1000, 5000))
        };
        
        newCandle.high = Math.max(newCandle.open, newCandle.close, newCandle.high);
        newCandle.low = Math.min(newCandle.open, newCandle.close, newCandle.low);
        
        this.data.push(newCandle);
        
        // Keep only last 200 candles
        if (this.data.length > 200) {
            this.data = this.data.slice(-200);
        }
    }

    // Update dashboard section
    updateDashboard() {
        const currentCandle = this.data[this.data.length - 1];
        
        // Update current price
        const currentPriceEl = document.getElementById('currentPrice');
        if (currentPriceEl) {
            Utils.animateNumber(currentPriceEl, 
                parseFloat(currentPriceEl.textContent) || currentCandle.close, 
                currentCandle.close);
        }

        // Update candle strength
        const candleStrengthEl = document.getElementById('candleStrength');
        if (candleStrengthEl) {
            const strength = Utils.calculateCandleBody(currentCandle);
            candleStrengthEl.textContent = Utils.formatPercentage(strength);
        }

        // Update signal status
        const signalStatusEl = document.getElementById('signalStatus');
        if (signalStatusEl) {
            const recentSignals = this.signalsManager.getRecentSignals(1);
            if (recentSignals.length > 0) {
                const signal = recentSignals[0];
                signalStatusEl.textContent = signal.type.toUpperCase();
                signalStatusEl.className = `signal-${signal.type}`;
            }
        }

        // Update RSI value
        const rsiValueEl = document.getElementById('rsiValue');
        if (rsiValueEl && this.indicators.rsi) {
            rsiValueEl.textContent = this.indicators.rsi.current.toFixed(1);
        }

        // NEW: Update Divergence Status
        this.updateDivergenceStatus();
    }

    // Update divergence status in dashboard
    updateDivergenceStatus() {
        // Check for divergence
        const divDetector = new RSIDivergenceDetector({
            useRSIDivergence: true,
            lookback: 15,
            minStrength: 2.0
        });

        const rsiData = this.indicators.rsi?.values || [];
        const priceData = this.data.map(candle => candle.close);
        const divergence = divDetector.getDivergenceSummary(rsiData, priceData);

        // Update divergence indicator in UI
        const divergenceEl = document.getElementById('divergenceStatus');
        if (divergenceEl) {
            if (divergence.hasDiv) {
                const icons = {
                    'bullish_regular': '🔄⬆️',
                    'bearish_regular': '🔄⬇️',
                    'bullish_hidden': '🔀⬆️',
                    'bearish_hidden': '🔀⬇️'
                };
                
                divergenceEl.innerHTML = `
                    <span class="div-icon">${icons[divergence.type] || '🔄'}</span>
                    <span class="div-type">${divergence.description}</span>
                    <span class="div-confidence confidence-${divergence.confidence}">${divergence.confidence}</span>
                `;
                divergenceEl.className = `divergence-active ${divergence.signal}`;
            } else {
                divergenceEl.innerHTML = '<span class="div-none">Nenhuma divergência</span>';
                divergenceEl.className = 'divergence-inactive';
            }
        }

        // Add divergence to recent signals display
        if (divergence.hasDiv) {
            this.showDivergenceAlert(divergence);
        }
    }

    // Show divergence alert
    showDivergenceAlert(divergence) {
        const alertText = `${divergence.description} detectada! Confiança: ${divergence.confidence}`;
        Utils.showToast(alertText, divergence.signal === 'buy' ? 'success' : 'warning');
        
        // Log divergence for analysis
        console.log('🔄 Divergência RSI:', {
            type: divergence.type,
            signal: divergence.signal,
            confidence: divergence.confidence,
            timestamp: divergence.timestamp
        });
    }

    // Update analysis section
    updateAnalysisSection() {
        this.updateCandlePatterns();
        this.updateTechnicalIndicators();
        this.updateSupportResistance();
    }

    // Update candle patterns display
    updateCandlePatterns() {
        const container = document.getElementById('candlePatterns');
        if (!container) return;

        container.innerHTML = '';
        
        this.patterns.forEach(pattern => {
            const patternEl = document.createElement('div');
            patternEl.className = 'pattern-item';
            patternEl.innerHTML = `
                <span class="pattern-name">${pattern.name}</span>
                <span class="pattern-strength ${pattern.reliability}">${pattern.reliability}</span>
            `;
            container.appendChild(patternEl);
        });

        if (this.patterns.length === 0) {
            container.innerHTML = '<div class="pattern-item">Nenhum padrão detectado</div>';
        }
    }

    // Update technical indicators display
    updateTechnicalIndicators() {
        // Update RSI
        const rsiIndicatorEl = document.getElementById('rsiIndicator');
        if (rsiIndicatorEl && this.indicators.rsi) {
            rsiIndicatorEl.textContent = this.indicators.rsi.current.toFixed(1);
            
            const rsiBar = rsiIndicatorEl.parentElement.querySelector('.indicator-fill');
            if (rsiBar) {
                rsiBar.style.width = `${this.indicators.rsi.current}%`;
            }
        }

        // Update MACD
        const macdIndicatorEl = document.getElementById('macdIndicator');
        if (macdIndicatorEl && this.indicators.macd) {
            const macdValue = this.indicators.macd.current;
            macdIndicatorEl.textContent = macdValue > 0 ? `+${macdValue.toFixed(4)}` : macdValue.toFixed(4);
            
            const macdStatus = macdIndicatorEl.parentElement.querySelector('.indicator-status');
            if (macdStatus) {
                macdStatus.textContent = macdValue > 0 ? 'Bullish' : 'Bearish';
                macdStatus.className = `indicator-status ${macdValue > 0 ? 'bullish' : 'bearish'}`;
            }
        }

        // Update Bollinger
        const bollingerIndicatorEl = document.getElementById('bollingerIndicator');
        if (bollingerIndicatorEl && this.indicators.bollinger) {
            const currentPrice = this.data[this.data.length - 1].close;
            const { upper, middle, lower } = this.indicators.bollinger.current;
            
            let position = 'Meio';
            if (currentPrice >= upper) position = 'Superior';
            else if (currentPrice <= lower) position = 'Inferior';
            
            bollingerIndicatorEl.textContent = position;
        }
    }

    // Update support and resistance levels
    updateSupportResistance() {
        // Simple support/resistance calculation based on recent highs/lows
        const recentData = this.data.slice(-20);
        const highs = recentData.map(d => d.high);
        const lows = recentData.map(d => d.low);
        
        const resistance = Math.max(...highs);
        const support = Math.min(...lows);
        
        const levelsContainer = document.querySelector('.levels-list');
        if (levelsContainer) {
            levelsContainer.innerHTML = `
                <div class="level-item resistance">
                    <span class="level-type">Resistência</span>
                    <span class="level-price">${resistance.toFixed(5)}</span>
                    <span class="level-strength">Forte</span>
                </div>
                <div class="level-item support">
                    <span class="level-type">Suporte</span>
                    <span class="level-price">${support.toFixed(5)}</span>
                    <span class="level-strength">Médio</span>
                </div>
            `;
        }
    }

    // Update signals section
    updateSignalsSection() {
        const signalsList = document.getElementById('signalsList');
        if (!signalsList) return;

        const signals = this.signalsManager.getRecentSignals(10);
        signalsList.innerHTML = '';

        signals.forEach(signal => {
            const signalEl = document.createElement('div');
            signalEl.className = 'signal-item';
            signalEl.innerHTML = `
                <div class="signal-info">
                    <div class="signal-pair">${signal.pair}</div>
                    <div class="signal-time">${Utils.timeAgo(signal.timestamp)}</div>
                    <div class="signal-reasons">${signal.reasons.slice(0, 2).join(', ')}</div>
                </div>
                <div class="signal-details">
                    <div class="signal-type ${signal.type}">${signal.type.toUpperCase()}</div>
                    <div class="signal-strength">Força: ${signal.strength.toFixed(0)}%</div>
                    <div class="signal-confidence">Conf: ${signal.confidence.toFixed(0)}%</div>
                </div>
            `;
            signalsList.appendChild(signalEl);
        });

        if (signals.length === 0) {
            signalsList.innerHTML = '<div class="signal-item">Nenhum sinal recente</div>';
        }
    }

    // Filter signals
    filterSignals(type) {
        const filteredSignals = this.signalsManager.filterSignals(type);
        this.displayFilteredSignals(filteredSignals);
    }

    // Display filtered signals
    displayFilteredSignals(signals) {
        const signalsList = document.getElementById('signalsList');
        if (!signalsList) return;

        signalsList.innerHTML = '';
        signals.slice(0, 10).forEach(signal => {
            const signalEl = document.createElement('div');
            signalEl.className = 'signal-item';
            signalEl.innerHTML = `
                <div class="signal-info">
                    <div class="signal-pair">${signal.pair}</div>
                    <div class="signal-time">${Utils.timeAgo(signal.timestamp)}</div>
                </div>
                <div class="signal-type ${signal.type}">${signal.type.toUpperCase()}</div>
            `;
            signalsList.appendChild(signalEl);
        });
    }

    // Update filter buttons
    updateFilterButtons(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // Toggle alerts
    toggleAlerts() {
        const isEnabled = this.signalsManager.toggleAlerts();
        const alertsBtn = document.getElementById('alertsToggle');
        if (alertsBtn) {
            alertsBtn.innerHTML = `
                <i class="fas fa-bell"></i>
                Alertas: ${isEnabled ? 'ON' : 'OFF'}
            `;
        }
        Utils.showToast(`Alertas ${isEnabled ? 'ativados' : 'desativados'}`, 'info');
    }

    // Start auto refresh
    startAutoRefresh() {
        this.stopAutoRefresh();
        
        if (this.autoRefresh) {
            this.refreshTimer = setInterval(() => {
                this.analyzeMarket();
            }, this.refreshInterval);
        }
    }

    // Stop auto refresh
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // Toggle auto refresh
    toggleAutoRefresh() {
        if (this.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        this.saveSettings();
    }

    // PWA Offline Methods
    enableOfflineMode() {
        console.log('📵 Enabling offline mode...');
        this.isOffline = true;
        
        // Stop auto refresh in offline mode
        this.stopAutoRefresh();
        
        // Load cached data
        this.loadCachedData();
        
        // Show offline indicator
        Utils.showToast('Modo offline - usando dados em cache', 'warning');
    }

    loadCachedData() {
        try {
            const cachedData = Utils.getFromStorage('cachedForexData');
            const cachedIndicators = Utils.getFromStorage('cachedIndicators');
            const cachedPatterns = Utils.getFromStorage('cachedPatterns');
            
            if (cachedData) {
                this.data = cachedData;
                console.log('📦 Loaded cached forex data');
            }
            
            if (cachedIndicators) {
                this.indicators = cachedIndicators;
                console.log('📦 Loaded cached indicators');
            }
            
            if (cachedPatterns) {
                this.patterns = cachedPatterns;
                console.log('📦 Loaded cached patterns');
            }
            
            // Update UI with cached data
            this.updateUI();
            if (this.chart) {
                this.chart.updateChart(this.data, this.indicators);
            }
            
        } catch (error) {
            console.error('❌ Failed to load cached data:', error);
        }
    }

    syncOfflineData() {
        console.log('🔄 Syncing offline data...');
        this.isOffline = false;
        
        // Resume auto refresh
        if (this.autoRefresh) {
            this.startAutoRefresh();
        }
        
        // Perform fresh analysis
        this.analyzeMarket();
        
        Utils.showToast('Dados sincronizados!', 'success');
    }

    cacheCurrentData() {
        try {
            Utils.saveToStorage('cachedForexData', this.data);
            Utils.saveToStorage('cachedIndicators', this.indicators);
            Utils.saveToStorage('cachedPatterns', this.patterns);
            Utils.saveToStorage('lastCacheTime', Date.now());
            console.log('💾 Data cached successfully');
        } catch (error) {
            console.error('❌ Failed to cache data:', error);
        }
    }

    // Update UI elements
    updateUI() {
        this.updateDashboard();
        this.updateAnalysisSection();
        this.updateSignalsSection();
        
        // Analisar pullback com os dados atuais
        if (typeof this.analyzePullback === 'function') {
            this.analyzePullback();
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        if (this.chart) this.chart.destroy();
        if (this.volumeChart) this.volumeChart.destroy();
    }
}

// News Management Methods - Extend ForexApp
ForexApp.prototype.loadNews = function() {
    console.log('📰 Loading news...');
    const mockNews = this.newsAnalyzer.getMockNewsData();
    this.newsData = this.newsAnalyzer.analyzeNewsStream(mockNews);
    this.renderNews();
    this.updateNewsSummary();
};

ForexApp.prototype.renderNews = function() {
    const newsFeed = document.getElementById('newsFeed');
    if (!newsFeed) return;
    
    if (this.newsData.length === 0) {
        newsFeed.innerHTML = '<div class="news-loading"><i class="fas fa-newspaper"></i><p>Nenhuma notícia disponível</p></div>';
        return;
    }
    
    newsFeed.innerHTML = this.newsData.map(news => {
        const analysis = news.analysis;
        const urgencyEmoji = { critical: '🚨', high: '⚠️', medium: '📢', low: '📰' }[analysis.urgency];
        const timeAgo = this.formatTimeAgo(new Date(news.timestamp));
        
        return `
            <div class="news-item ${analysis.sentiment} ${analysis.urgency === 'critical' ? 'critical' : ''}" data-sentiment="${analysis.sentiment}">
                <div class="news-item-header">
                    <h3 class="news-item-title">${news.title}</h3>
                    <span class="news-urgency">${urgencyEmoji}</span>
                </div>
                <div class="news-item-content">${news.content}</div>
                <div class="news-analysis">
                    <span class="analysis-badge sentiment ${analysis.sentiment}">
                        ${analysis.sentiment === 'positive' ? '📈' : analysis.sentiment === 'negative' ? '📉' : '➖'}
                        ${analysis.sentiment.toUpperCase()} (${analysis.confidence}%)
                    </span>
                    <span class="analysis-badge impact ${analysis.impactLevel}">
                        Impacto: ${analysis.impactLevel.toUpperCase()}
                    </span>
                    ${analysis.affectedCurrencies.length > 0 ? `
                        <div class="affected-currencies">
                            ${analysis.affectedCurrencies.slice(0, 3).map(c => 
                                `<span class="currency-tag">${c.currency}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                ${analysis.recommendation.action !== 'hold' ? `
                    <div class="news-recommendation ${analysis.recommendation.action}">
                        <div class="recommendation-title">💡 Recomendação: ${analysis.recommendation.action.toUpperCase()}</div>
                        <div class="recommendation-text">${analysis.recommendation.description}</div>
                    </div>
                ` : ''}
                <div class="news-item-meta">
                    <span class="news-source"><i class="fas fa-newspaper"></i> ${news.source}</span>
                    <span class="news-timestamp"><i class="fas fa-clock"></i> ${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
};

ForexApp.prototype.updateNewsSummary = function() {
    const summary = { positive: 0, negative: 0, neutral: 0, critical: 0 };
    this.newsData.forEach(news => {
        summary[news.analysis.sentiment]++;
        if (news.analysis.urgency === 'critical') summary.critical++;
    });
    
    ['positive', 'negative', 'neutral', 'critical'].forEach(type => {
        const el = document.getElementById(`${type}Count`);
        if (el) el.textContent = summary[type];
    });
};

ForexApp.prototype.filterNews = function(sentiment) {
    document.querySelectorAll('.news-item').forEach(item => {
        if (sentiment === 'all') {
            item.style.display = 'block';
        } else if (sentiment === 'critical') {
            item.style.display = item.classList.contains('critical') ? 'block' : 'none';
        } else {
            item.style.display = item.dataset.sentiment === sentiment ? 'block' : 'none';
        }
    });
};

ForexApp.prototype.updateNewsFilterButtons = function(activeBtn) {
    document.querySelectorAll('.news-filter-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
};

ForexApp.prototype.startNewsAutoRefresh = function() {
    this.stopNewsAutoRefresh();
    this.newsRefreshTimer = setInterval(() => {
        this.loadNews();
        console.log('📰 News auto-refreshed');
    }, 60000);
};

ForexApp.prototype.stopNewsAutoRefresh = function() {
    if (this.newsRefreshTimer) {
        clearInterval(this.newsRefreshTimer);
        this.newsRefreshTimer = null;
    }
};

ForexApp.prototype.formatTimeAgo = function(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { 'ano': 31536000, 'mês': 2592000, 'dia': 86400, 'hora': 3600, 'minuto': 60 };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `há ${interval} ${name}${interval > 1 && name !== 'mês' ? 's' : name === 'mês' && interval > 1 ? 'es' : ''}`;
        }
    }
    return 'agora mesmo';
};

// Override navigateToSection to load news
const originalNavigate = ForexApp.prototype.navigateToSection;
ForexApp.prototype.navigateToSection = function(sectionId) {
    if (originalNavigate) {
        originalNavigate.call(this, sectionId);
    } else {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('active');
        const link = document.querySelector(`[href="#${sectionId}"]`);
        if (link) link.classList.add('active');
    }
    
    if (sectionId === 'news' && (!this.newsData || this.newsData.length === 0)) {
        this.loadNews();
        this.newsAutoRefresh = true;
        this.startNewsAutoRefresh();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing Forex App...');
    try {
        window.forexApp = new ForexApp();
        console.log('✅ Forex App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Forex App:', error);
    }
});

// PWA Enhanced Features
class PWAManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupOfflineHandling();
        this.setupBackgroundSync();
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
                // Register for background sync when data needs to be synced
                this.syncRegistration = registration;
            });
        }
    }

    handleOnlineStatus() {
        console.log('🌐 App is back online');
        if (window.forexApp) {
            window.forexApp.syncOfflineData();
        }
    }

    handleOfflineStatus() {
        console.log('📵 App is now offline');
        if (window.forexApp) {
            window.forexApp.enableOfflineMode();
        }
    }

    async requestBackgroundSync(tag = 'forex-data-sync') {
        if (this.syncRegistration) {
            try {
                await this.syncRegistration.sync.register(tag);
                console.log('🔄 Background sync registered:', tag);
            } catch (error) {
                console.error('❌ Background sync failed:', error);
            }
        }
    }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.forexApp) {
        window.forexApp.destroy();
    }
});

// Pullback Indicator Integration Methods
ForexApp.prototype.analyzePullback = function() {
    if (!this.data || this.data.length < 50) {
        console.warn('Insufficient data for pullback analysis');
        return;
    }

    try {
        // Preparar dados dos candles
        const candles = this.data.map((item, index) => {
            const open = item.open;
            const close = item.close;
            const high = Math.max(open, close) * (1 + Math.random() * 0.002);
            const low = Math.min(open, close) * (1 - Math.random() * 0.002);

            return {
                time: Date.now() - (this.data.length - index) * 15 * 60 * 1000,
                open,
                high,
                low,
                close
            };
        });

        // Analisar com o indicador
        const result = this.pullbackIndicator.analyze(candles);
        
        this.pullbackData = {
            levels: result.levels,
            signals: result.signals,
            lastAnalysis: Date.now(),
            stats: this.pullbackIndicator.getStats()
        };

        // Atualizar UI com níveis ativos
        this.updatePullbackStatus();

        // Se houver novos sinais, processar
        if (result.signals.length > 0) {
            result.signals.forEach(signal => {
                console.log('🎯 Pullback Signal:', signal);
                this.processPullbackSignal(signal);
            });
        }

        // Limpar níveis antigos (maiores que 2 horas)
        this.pullbackIndicator.cleanupOldLevels(120);

    } catch (error) {
        console.error('Error analyzing pullback:', error);
    }
};

ForexApp.prototype.processPullbackSignal = function(signal) {
    // Adicionar ao histórico de sinais
    const signalData = {
        type: 'PULLBACK',
        direction: signal.type,
        price: signal.price,
        confidence: signal.confidence,
        time: signal.time,
        pair: this.currentPair,
        timeframe: this.currentTimeframe
    };

    // Salvar no localStorage
    const history = JSON.parse(localStorage.getItem('pullbackSignals') || '[]');
    history.unshift(signalData);
    localStorage.setItem('pullbackSignals', JSON.stringify(history.slice(0, 100)));

    // Atualizar display
    this.updatePullbackStatus('signal');
};

ForexApp.prototype.updatePullbackStatus = function(state = 'active') {
    const statusElement = document.getElementById('pullbackStatus');
    if (!statusElement) return;

    const activeLevels = this.pullbackData.levels ? this.pullbackData.levels.length : 0;
    const stats = this.pullbackData.stats || {};

    if (state === 'signal') {
        statusElement.className = 'pullback-signal';
        statusElement.innerHTML = `
            🎯 <strong>Sinal Pullback Detectado!</strong>
            <span style="margin-left: 8px">Confiança: ${stats.lastSignal?.confidence || 0}%</span>
        `;
        
        setTimeout(() => {
            this.updatePullbackStatus(activeLevels > 0 ? 'active' : 'inactive');
        }, 5000);
    } else if (activeLevels > 0) {
        statusElement.className = 'pullback-active';
        statusElement.innerHTML = `
            📊 <strong>${activeLevels} Nível${activeLevels > 1 ? 'is' : ''} Ativo${activeLevels > 1 ? 's' : ''}</strong>
            <span style="margin-left: 8px">| Total Sinais: ${stats.totalSignals || 0}</span>
        `;
    } else {
        statusElement.className = 'pullback-inactive';
        statusElement.innerHTML = `
            💤 Aguardando Rompimento
            <span style="margin-left: 8px">| Sinais: ${stats.totalSignals || 0}</span>
        `;
    }
};

ForexApp.prototype.drawPullbackLevels = function() {
    // Remove níveis antigos do canvas
    const container = document.querySelector('.chart-container');
    if (!container) return;

    const oldLines = container.querySelectorAll('.pullback-level-line');
    oldLines.forEach(line => line.remove());

    // Desenhar novos níveis
    if (!this.pullbackData.levels || this.pullbackData.levels.length === 0) return;

    const chartHeight = container.offsetHeight;
    const priceRange = this.getPriceRange();
    if (!priceRange) return;

    this.pullbackData.levels.forEach(level => {
        const pricePercent = (level.price - priceRange.min) / (priceRange.max - priceRange.min);
        const yPosition = chartHeight - (pricePercent * chartHeight);

        const line = document.createElement('div');
        line.className = `pullback-level-line ${level.type}`;
        line.style.top = `${yPosition}px`;
        line.style.left = '0';
        line.style.right = '0';
        line.title = `Pullback ${level.type} @ ${level.price.toFixed(5)}`;

        container.appendChild(line);
    });
};

ForexApp.prototype.getPriceRange = function() {
    if (!this.data || this.data.length === 0) return null;

    const prices = this.data.flatMap(d => [d.open, d.close, d.high, d.low]);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
};

ForexApp.prototype.configurePullbackIndicator = function(config) {
    this.pullbackIndicator.updateConfig(config);
    this.analyzePullback();
};

ForexApp.prototype.getPullbackHistory = function() {
    return JSON.parse(localStorage.getItem('pullbackSignals') || '[]');
};

ForexApp.prototype.clearPullbackHistory = function() {
    localStorage.removeItem('pullbackSignals');
    this.pullbackIndicator.reset();
    this.pullbackData = { levels: [], signals: [], lastAnalysis: null };
    this.updatePullbackStatus('inactive');
};

// Initialize PWA Manager
window.addEventListener('load', () => {
    window.pwaManager = new PWAManager();
});