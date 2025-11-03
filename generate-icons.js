#!/usr/bin/env node

// Icon Generator Script for Forex Analyzer PWA
// This script creates placeholder PNG icons for the PWA

const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to create a simple HTML canvas-based icon generator
function createIconHTML(size) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator ${size}x${size}</title>
    <style>
        body { margin: 0; padding: 20px; background: #000; }
        canvas { border: 1px solid #333; }
    </style>
</head>
<body>
    <canvas id="canvas" width="${size}" height="${size}"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, ${size}, ${size});
        gradient.addColorStop(0, '#0052ff');
        gradient.addColorStop(1, '#001a66');
        
        // Draw background with rounded corners
        const radius = ${size * 0.1875}; // 96/512 ratio
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(0, 0, ${size}, ${size}, radius);
        ctx.fill();
        
        // Chart area
        const chartX = ${size * 0.125};
        const chartY = ${size * 0.25};
        const chartW = ${size * 0.75};
        const chartH = ${size * 0.5};
        
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(chartX, chartY, chartW, chartH, ${size * 0.03125});
        ctx.fill();
        ctx.stroke();
        
        // Simple candlestick representation
        const candleWidth = ${size * 0.03125};
        const candleSpacing = ${size * 0.09375};
        
        // Green candles
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(chartX + candleSpacing, chartY + ${size * 0.125}, candleWidth, ${size * 0.1875});
        ctx.fillRect(chartX + candleSpacing * 3, chartY + ${size * 0.0625}, candleWidth, ${size * 0.25});
        ctx.fillRect(chartX + candleSpacing * 5, chartY + ${size * 0.09375}, candleWidth, ${size * 0.1875});
        
        // Red candles
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(chartX + candleSpacing * 2, chartY + ${size * 0.15625}, candleWidth, ${size * 0.125});
        ctx.fillRect(chartX + candleSpacing * 4, chartY + ${size * 0.1875}, candleWidth, ${size * 0.15625});
        ctx.fillRect(chartX + candleSpacing * 6, chartY + ${size * 0.21875}, candleWidth, ${size * 0.09375});
        
        // Currency symbol
        ctx.fillStyle = 'white';
        ctx.font = 'bold ${size * 0.07}px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FX', ${size / 2}, ${size * 0.2});
        
        // AI indicator
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(${size * 0.78125}, ${size * 0.15625}, ${size * 0.0390625}, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold ${size * 0.03125}px Arial';
        ctx.fillText('AI', ${size * 0.78125}, ${size * 0.171875});
        
        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold ${size * 0.046875}px Arial';
        ctx.fillText('FOREX', ${size / 2}, ${size * 0.89});
        
        ctx.font = '${size * 0.03125}px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('ANALYZER', ${size / 2}, ${size * 0.94});
        
        // Download function
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = 'icon-${size}.png';
            link.href = canvas.toDataURL();
            link.click();
        }, 1000);
    </script>
</body>
</html>`;
}

// Generate HTML files for each icon size
iconSizes.forEach(size => {
    const htmlContent = createIconHTML(size);
    const filename = `icon-generator-${size}.html`;
    fs.writeFileSync(path.join(assetsDir, filename), htmlContent);
    console.log(`✅ Created ${filename}`);
});

console.log(`
🎨 Icon generation files created!

To generate the actual PNG icons:
1. Open each icon-generator-*.html file in a browser
2. The PNG will download automatically
3. Save them as icon-72.png, icon-96.png, etc. in the assets folder

Alternatively, you can use online tools or design software to create custom icons.
`);