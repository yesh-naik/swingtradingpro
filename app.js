// SwingTradingPro Dashboard - Main Application
// Loads trading_data.json and displays live data

const DATA_URL = 'trading_data.json';
let currentData = null;

// Initialize dashboard
async function init() {
    await loadData();
    startAutoRefresh();
}

// Load trading data from JSON
async function loadData() {
    try {
        const response = await fetch(DATA_URL + '?t=' + Date.now()); // Cache busting
        currentData = await response.json();
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
    }
}

// Update all dashboard elements
function updateDashboard() {
    if (!currentData) return;
    
    updatePortfolioSummary();
    updatePositions();
    updatePerformanceMetrics();
    updateStrategyPerformance();
    updateRiskMetrics();
    updateLastUpdated();
}

// Update portfolio summary cards
function updatePortfolioSummary() {
    const portfolio = currentData.portfolio;
    
    document.getElementById('totalCapital').textContent = formatCurrency(portfolio.pilot_capital);
    document.getElementById('deployedCapital').textContent = formatCurrency(portfolio.deployed_capital);
    document.getElementById('deployedPercent').textContent = portfolio.deployed_percentage.toFixed(1) + '%';
    document.getElementById('cashAvailable').textContent = formatCurrency(portfolio.available_cash);
    document.getElementById('activePositions').textContent = portfolio.active_positions_count;
    document.getElementById('maxPositions').textContent = '/ ' + portfolio.max_positions + ' max';
    
    // P&L with color
    const pnlElement = document.getElementById('totalPnL');
    const pnlPercentElement = document.getElementById('totalPnLPercent');
    const pnl = portfolio.total_unrealized_pnl;
    const pnlPercent = portfolio.total_unrealized_pnl_percent;
    
    pnlElement.textContent = formatCurrency(pnl);
    pnlPercentElement.textContent = (pnl >= 0 ? '+' : '') + pnlPercent.toFixed(2) + '%';
    
    pnlElement.className = 'card-value pnl ' + (pnl >= 0 ? 'positive' : 'negative');
    pnlPercentElement.className = 'card-subtext ' + (pnl >= 0 ? 'positive' : 'negative');
}

// Update active positions
function updatePositions() {
    const container = document.getElementById('positionsContainer');
    const positions = currentData.active_positions;
    
    if (positions.length === 0) {
        container.innerHTML = '<div class="no-positions">No active positions</div>';
        return;
    }
    
    container.innerHTML = positions.map(pos => createPositionCard(pos)).join('');
}

// Create position card HTML
function createPositionCard(pos) {
    const pnlClass = pos.unrealized_pnl >= 0 ? 'positive' : 'negative';
    const pnlSign = pos.unrealized_pnl >= 0 ? '+' : '';
    
    return `
        <div class="position-card">
            <div class="position-header">
                <div class="position-stock">
                    <h3>${pos.stock}</h3>
                    <div class="position-name">${pos.stock_name}</div>
                </div>
                <div class="position-pnl ${pnlClass}">
                    <div class="pnl-amount">${pnlSign}${formatCurrency(pos.unrealized_pnl)}</div>
                    <div class="pnl-percent">${pnlSign}${pos.unrealized_pnl_percent.toFixed(2)}%</div>
                </div>
            </div>
            
            <div class="position-details">
                <div class="detail-row">
                    <span class="detail-label">Entry:</span>
                    <span class="detail-value">₹${pos.entry_price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Current:</span>
                    <span class="detail-value">₹${pos.current_price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shares:</span>
                    <span class="detail-value">${pos.quantity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Capital:</span>
                    <span class="detail-value">${formatCurrency(pos.invested_capital)}</span>
                </div>
            </div>
            
            <div class="position-targets">
                <div class="target-item">
                    <div class="target-label">Stop Loss</div>
                    <div class="target-value">₹${pos.stop_loss.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar sl">
                            <div class="progress-fill" style="width: ${Math.min(pos.distance_to_sl_percent, 100)}%"></div>
                        </div>
                        <span class="target-distance">${pos.distance_to_sl_percent.toFixed(1)}% away</span>
                    </div>
                </div>
                
                <div class="target-item">
                    <div class="target-label">Target 1</div>
                    <div class="target-value">₹${pos.target_1.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar t1">
                            <div class="progress-fill" style="width: ${Math.max(0, 100 - pos.distance_to_t1_percent)}%"></div>
                        </div>
                        <span class="target-distance">${pos.distance_to_t1_percent.toFixed(1)}% away</span>
                    </div>
                </div>
                
                <div class="target-item">
                    <div class="target-label">Target 2</div>
                    <div class="target-value">₹${pos.target_2.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar t2">
                            <div class="progress-fill" style="width: ${Math.max(0, 100 - pos.distance_to_t2_percent)}%"></div>
                        </div>
                        <span class="target-distance">${pos.distance_to_t2_percent.toFixed(1)}% away</span>
                    </div>
                </div>
            </div>
            
            <div class="position-meta">
                <span class="meta-badge">${pos.strategy}</span>
                <span class="meta-badge">${pos.sector}</span>
                <span class="meta-badge conviction-${pos.conviction.toLowerCase()}">${pos.conviction} Conviction</span>
                <span class="meta-badge score">${pos.score}/10</span>
            </div>
            
            <div class="position-footer">
                <span class="gtt-status ${pos.gtt_active ? 'active' : 'inactive'}">
                    ${pos.gtt_active ? '✅' : '❌'} GTT ${pos.gtt_active ? 'Active' : 'Inactive'}
                </span>
                <span class="days-held">Day ${pos.days_held}</span>
            </div>
        </div>
    `;
}

// Update performance metrics
function updatePerformanceMetrics() {
    const metrics = currentData.performance_metrics.all_time;
    
    document.getElementById('totalTrades').textContent = metrics.total_trades;
    document.getElementById('winRate').textContent = metrics.win_rate ? metrics.win_rate.toFixed(1) + '%' : 'N/A';
    document.getElementById('avgWin').textContent = metrics.average_win ? formatCurrency(metrics.average_win) : 'N/A';
    document.getElementById('avgLoss').textContent = metrics.average_loss ? formatCurrency(metrics.average_loss) : 'N/A';
}

// Update strategy performance
function updateStrategyPerformance() {
    const container = document.getElementById('strategyContainer');
    const strategies = currentData.performance_metrics.by_strategy;
    
    container.innerHTML = Object.entries(strategies).map(([name, stats]) => `
        <div class="strategy-card">
            <h3>${name}</h3>
            <div class="strategy-stats">
                <div class="stat">
                    <span class="stat-label">Trades:</span>
                    <span class="stat-value">${stats.total_trades}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Win Rate:</span>
                    <span class="stat-value">${stats.win_rate ? stats.win_rate.toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">P&L:</span>
                    <span class="stat-value ${stats.total_pnl >= 0 ? 'positive' : 'negative'}">
                        ${stats.total_pnl >= 0 ? '+' : ''}${formatCurrency(stats.total_pnl)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update risk metrics
function updateRiskMetrics() {
    const risk = currentData.risk_metrics;
    
    // Daily loss
    const dailyLossPercent = (risk.daily_loss_used / risk.daily_loss_limit) * 100;
    document.getElementById('dailyLoss').textContent = 
        `${formatCurrency(risk.daily_loss_used)} / ${formatCurrency(risk.daily_loss_limit)}`;
    document.getElementById('dailyLossBar').style.width = dailyLossPercent + '%';
    document.getElementById('dailyLossBar').className = 
        'risk-bar-fill ' + (dailyLossPercent > 80 ? 'danger' : dailyLossPercent > 50 ? 'warning' : 'safe');
    
    // Drawdown
    const drawdownPercent = (risk.current_drawdown_percent / risk.max_drawdown_limit_percent) * 100;
    document.getElementById('drawdown').textContent = 
        `${risk.current_drawdown_percent.toFixed(2)}% / ${risk.max_drawdown_limit_percent}% max`;
    document.getElementById('drawdownBar').style.width = drawdownPercent + '%';
    document.getElementById('drawdownBar').className = 
        'risk-bar-fill ' + (drawdownPercent > 80 ? 'danger' : drawdownPercent > 50 ? 'warning' : 'safe');
    
    // Risk status
    const statusElement = document.getElementById('riskStatus');
    statusElement.textContent = risk.risk_status.replace('_', ' ');
    statusElement.className = 'risk-status ' + risk.risk_status.toLowerCase();
}

// Update last updated timestamp
function updateLastUpdated() {
    const timestamp = currentData.metadata.last_updated;
    const date = new Date(timestamp);
    document.getElementById('lastUpdated').textContent = 
        'Last updated: ' + date.toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });
}

// Format currency
function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (absAmount >= 100000) {
        return sign + '₹' + (absAmount / 100000).toFixed(2) + 'L';
    } else if (absAmount >= 1000) {
        return sign + '₹' + (absAmount / 1000).toFixed(2) + 'K';
    }
    return sign + '₹' + absAmount.toFixed(2);
}

// Show error message
function showError() {
    document.querySelector('.container').innerHTML = `
        <div class="error-message">
            <h2>⚠️ Error Loading Data</h2>
            <p>Unable to load trading data. Please check that trading_data.json exists.</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
}

// Auto-refresh every 60 seconds
function startAutoRefresh() {
    setInterval(() => {
        loadData();
    }, 60000); // 60 seconds
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
