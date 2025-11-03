// Chart Management and Visualization

class ForexChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.data = [];
        this.indicators = {};
        this.chartType = 'candlestick';
        this.timeframe = 'H1';
        
        this.initializeChart();
    }

    // Initialize Chart.js instance
    initializeChart() {
        if (!this.canvas) {
            console.error('Cannot initialize chart: canvas not found');
            return;
        }
        
        const ctx = this.canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line', // We'll customize this for candlesticks
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3cc'
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3cc',
                            callback: function(value) {
                                return value.toFixed(5);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#b3b3cc',
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 46, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#b3b3cc',
                        borderColor: '#0052ff',
                        borderWidth: 1,
                        callbacks: {
                            title: function(context) {
                                return new Date(context[0].parsed.x).toLocaleString('pt-BR');
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${datasetLabel}: ${value.toFixed(5)}`;
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 4
                    },
                    line: {
                        borderWidth: 2,
                        tension: 0
                    }
                }
            }
        });
    }

    // Update chart with new data
    updateChart(data, indicators = {}) {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }
        
        this.data = data;
        this.indicators = indicators;
        
        try {
            if (this.chartType === 'candlestick') {
                this.renderCandlestickChart();
            } else {
                this.renderLineChart();
            }
            
            this.addIndicators();
            this.chart.update('none');
            console.log('Chart updated successfully');
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    // Render candlestick chart (using line chart with custom styling)
    renderCandlestickChart() {
        const labels = this.data.map((candle, index) => `${index + 1}`);
        const closes = this.data.map(candle => candle.close);
        const highs = this.data.map(candle => candle.high);
        const lows = this.data.map(candle => candle.low);

        // Create price line dataset
        const priceDataset = {
            label: 'Preço',
            data: closes,
            borderColor: '#0052ff',
            backgroundColor: 'rgba(0, 82, 255, 0.1)',
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2
        };

        // Create high/low range dataset
        const rangeDataset = {
            label: 'Range H/L',
            data: highs,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fill: '+1', // Fill to the next dataset (lows)
            pointRadius: 0,
            borderWidth: 1
        };

        const lowDataset = {
            label: 'Low',
            data: lows,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            fill: false
        };

        this.chart.data.labels = labels;
        this.chart.data.datasets = [lowDataset, rangeDataset, priceDataset];
    }

    // Render simple line chart
    renderLineChart() {
        const labels = this.data.map((candle, index) => `${index + 1}`);
        const closes = this.data.map(candle => candle.close);

        const priceDataset = {
            label: 'Preço',
            data: closes,
            borderColor: '#0052ff',
            backgroundColor: 'rgba(0, 82, 255, 0.1)',
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2
        };

        this.chart.data.labels = labels;
        this.chart.data.datasets = [priceDataset];
    }

    // Add technical indicators to chart
    addIndicators() {
        const datasets = [...this.chart.data.datasets];

        // Add RSI if available
        if (this.indicators.rsi && this.indicators.rsi.values.length > 0) {
            // RSI is typically shown in a separate panel, but we'll overlay it scaled
            const rsiScaled = this.indicators.rsi.values.map(value => {
                const minPrice = Math.min(...this.data.map(d => d.low));
                const maxPrice = Math.max(...this.data.map(d => d.high));
                const priceRange = maxPrice - minPrice;
                return minPrice + (value / 100) * priceRange;
            });

            datasets.push({
                label: 'RSI (escalonado)',
                data: rsiScaled,
                borderColor: '#ffa502',
                backgroundColor: 'transparent',
                fill: false,
                pointRadius: 0,
                borderWidth: 1,
                hidden: true // Hidden by default
            });
        }

        // Add Bollinger Bands
        if (this.indicators.bollinger) {
            const { upper, middle, lower } = this.indicators.bollinger;
            
            if (upper.length > 0) {
                datasets.push({
                    label: 'Bollinger Superior',
                    data: upper,
                    borderColor: '#e74c3c',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [5, 5]
                });

                datasets.push({
                    label: 'Bollinger Médio',
                    data: middle,
                    borderColor: '#f39c12',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1
                });

                datasets.push({
                    label: 'Bollinger Inferior',
                    data: lower,
                    borderColor: '#27ae60',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [5, 5]
                });
            }
        }

        // Add Moving Averages
        if (this.data.length >= 20) {
            const sma20 = TechnicalIndicators.calculateSMA(this.data, 20);
            const sma50 = TechnicalIndicators.calculateSMA(this.data, 50);

            if (sma20.length > 0) {
                datasets.push({
                    label: 'SMA 20',
                    data: [...Array(this.data.length - sma20.length).fill(null), ...sma20],
                    borderColor: '#9b59b6',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1
                });
            }

            if (sma50.length > 0) {
                datasets.push({
                    label: 'SMA 50',
                    data: [...Array(this.data.length - sma50.length).fill(null), ...sma50],
                    borderColor: '#e67e22',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1
                });
            }
        }

        this.chart.data.datasets = datasets;
    }

    // Set chart type
    setChartType(type) {
        this.chartType = type;
        this.updateChart(this.data, this.indicators);
    }

    // Set timeframe
    setTimeframe(timeframe) {
        this.timeframe = timeframe;
        
        // Update time scale unit based on timeframe
        let unit = 'hour';
        if (timeframe.includes('M')) unit = 'minute';
        else if (timeframe.includes('H')) unit = 'hour';
        else if (timeframe.includes('D')) unit = 'day';

        this.chart.options.scales.x.time.unit = unit;
        this.chart.update();
    }

    // Add pattern annotations
    addPatternAnnotations(patterns) {
        // This would require Chart.js annotation plugin
        // For now, we'll just log the patterns
        console.log('Patterns detected:', patterns);
    }

    // Highlight support/resistance levels
    addSupportResistanceLevels(levels) {
        // Add horizontal lines for support/resistance
        const annotations = levels.map(level => ({
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: level.price,
            borderColor: level.type === 'support' ? '#27ae60' : '#e74c3c',
            borderWidth: 2,
            borderDash: [10, 5],
            label: {
                content: `${level.type}: ${level.price.toFixed(5)}`,
                enabled: true,
                position: 'right'
            }
        }));

        // This requires the annotation plugin
        console.log('Support/Resistance levels:', levels);
    }

    // Export chart as image
    exportChart() {
        const link = document.createElement('a');
        link.download = `forex_chart_${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    // Toggle indicator visibility
    toggleIndicator(indicatorName) {
        const dataset = this.chart.data.datasets.find(ds => 
            ds.label.toLowerCase().includes(indicatorName.toLowerCase())
        );
        
        if (dataset) {
            dataset.hidden = !dataset.hidden;
            this.chart.update();
        }
    }

    // Get chart data for analysis
    getVisibleData() {
        return {
            timeRange: {
                start: this.chart.scales.x.min,
                end: this.chart.scales.x.max
            },
            priceRange: {
                min: this.chart.scales.y.min,
                max: this.chart.scales.y.max
            },
            visibleCandles: this.data.filter(candle => {
                return candle.timestamp >= this.chart.scales.x.min && 
                       candle.timestamp <= this.chart.scales.x.max;
            })
        };
    }

    // Zoom to specific date range
    zoomToRange(startDate, endDate) {
        this.chart.options.scales.x.min = startDate;
        this.chart.options.scales.x.max = endDate;
        this.chart.update();
    }

    // Reset zoom
    resetZoom() {
        this.chart.options.scales.x.min = undefined;
        this.chart.options.scales.x.max = undefined;
        this.chart.update();
    }

    // Destroy chart instance
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Volume Chart Class
class VolumeChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Volume chart canvas with id '${canvasId}' not found - this is optional`);
            return;
        }
        this.chart = null;
        this.initializeChart();
    }

    initializeChart() {
        if (!this.canvas) {
            return;
        }
        const ctx = this.canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Volume',
                    data: [],
                    backgroundColor: 'rgba(0, 212, 170, 0.6)',
                    borderColor: '#00d4aa',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3cc'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3cc'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 46, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#b3b3cc',
                        borderColor: '#00d4aa',
                        borderWidth: 1
                    }
                }
            }
        });
    }

    updateChart(data) {
        if (!this.chart) {
            console.warn('Volume chart not initialized');
            return;
        }
        
        try {
            const labels = data.map((_, index) => `${index + 1}`);
            const volumes = data.map(candle => candle.volume || 0);

            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = volumes;
            this.chart.update('none');
        } catch (error) {
            console.error('Error updating volume chart:', error);
        }
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Export for use in other modules
window.ForexChart = ForexChart;
window.VolumeChart = VolumeChart;