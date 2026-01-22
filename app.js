// SwingTradingPro Dashboard - Main Application
// Loads trading_data.json and displays live data

const DATA_URL = './trading_data.json';
let currentData = null;

// Initialize dashboard
async function init() {
    console.log('Initializing dashboard...');
    await loadData();
    startAutoRefresh();
}

// Load trading data from JSON
async function loadData() {
    try {
        console.log('Fetching data from:', DATA_URL);
        const response = await fetch(DATA_URL + '?t=' + Date.now()); // Cache busting
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Data received, length:', text.length);
        
        currentData = JSON.parse(text);
        console.log('Data parsed successfully:', currentData);
        
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', error.message);
        showError(error.message);
    }
}

// Update all dashboard elements
function updateDashboard() {
    if (!currentData) return;
    
    updatePortfolioSummary();
    updatePositions();
    updateClosedTrades();
    updatePerformanceMetrics();
    updateStrategyPerformance();
    updateRiskMetrics();
    updateLessonsLearned();
    updateLastUpdated();
}

// Update portfolio summary cards
function updatePortfolioSummary() {
    const portfolio = currentData.portfolio;
    
    document.getElementById('totalCapital').textContent = formatCurrency(portfolio.pilot_capital || portfolio.total_capital);
    document.getElementById('deployedCapital').textContent = formatCurrency(portfolio.deployed_capital);
    
    // Calculate deployed percentage if not present
    const deployedPercent = portfolio.deployed_percentage || 
        ((portfolio.deployed_capital / (portfolio.pilot_capital || portfolio.total_capital)) * 100);
    document.getElementById('deployedPercent').textContent = deployedPercent.toFixed(1) + '%';
    
    document.getElementById('cashAvailable').textContent = formatCurrency(portfolio.cash_available || portfolio.available_cash);
    document.getElementById('activePositions').textContent = portfolio.active_positions || portfolio.active_positions_count;
    document.getElementById('maxPositions').textContent = '/ ' + portfolio.max_positions + ' max';
    
    // P&L with color - handle both field name variations
    const pnlElement = document.getElementById('totalPnL');
    const pnlPercentElement = document.getElementById('totalPnLPercent');
    const pnl = portfolio.total_pnl || portfolio.total_unrealized_pnl || 0;
    const pnlPercent = portfolio.total_pnl_percent || portfolio.total_unrealized_pnl_percent || 0;
    
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
    
    // Handle field name variations
    const stockName = pos.stock_name || pos.full_name;
    const quantity = pos.quantity || pos.shares;
    const capitalInvested = pos.invested_capital || pos.capital_invested;
    const distanceToSL = pos.distance_to_sl_percent || 0;
    const distanceToT1 = pos.distance_to_t1_percent || 0;
    const distanceToT2 = pos.distance_to_t2_percent || 0;
    const daysHeld = pos.days_held || 0;
    const gttActive = pos.gtt_active !== undefined ? pos.gtt_active : false;
    
    return `
        <div class="position-card">
            <div class="position-header">
                <div class="position-stock">
                    <h3>${pos.stock}</h3>
                    <div class="position-name">${stockName}</div>
                </div>
                <div class="position-pnl ${pnlClass}">
                    <div class="pnl-amount">${pnlSign}${formatCurrency(pos.unrealized_pnl)}</div>
                    <div class="pnl-percent">${pnlSign}${pos.pnl_percent.toFixed(2)}%</div>
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
                    <span class="detail-value">${quantity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Capital:</span>
                    <span class="detail-value">${formatCurrency(capitalInvested)}</span>
                </div>
            </div>
            
            <div class="position-targets">
                <div class="target-item">
                    <div class="target-label">Stop Loss</div>
                    <div class="target-value">₹${pos.stop_loss.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar sl">
                            <div class="progress-fill" style="width: ${Math.min(distanceToSL, 100)}%"></div>
                        </div>
                        <span class="target-distance">${distanceToSL.toFixed(1)}% away</span>
                    </div>
                </div>
                
                <div class="target-item">
                    <div class="target-label">Target 1</div>
                    <div class="target-value">₹${pos.target_1.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar t1">
                            <div class="progress-fill" style="width: ${Math.max(0, 100 - distanceToT1)}%"></div>
                        </div>
                        <span class="target-distance">${distanceToT1.toFixed(1)}% away</span>
                    </div>
                </div>
                
                <div class="target-item">
                    <div class="target-label">Target 2</div>
                    <div class="target-value">₹${pos.target_2.toFixed(2)}</div>
                    <div class="target-progress">
                        <div class="progress-bar t2">
                            <div class="progress-fill" style="width: ${Math.max(0, 100 - distanceToT2)}%"></div>
                        </div>
                        <span class="target-distance">${distanceToT2.toFixed(1)}% away</span>
                    </div>
                </div>
            </div>
            
            <div class="position-meta">
                <span class="meta-badge">${pos.strategy}</span>
                <span class="meta-badge">${pos.sector}</span>
                <span class="meta-badge conviction-${pos.conviction.toLowerCase()}">${pos.conviction} Conviction</span>
                <span class="meta-badge score">${pos.score}</span>
            </div>
            
            <div class="position-footer">
                <span class="gtt-status ${gttActive ? 'active' : 'inactive'}">
                    ${gttActive ? '✅' : '❌'} GTT ${gttActive ? 'Active' : 'Inactive'}
                </span>
                <span class="days-held">Day ${daysHeld}</span>
            </div>
        </div>
    `;
}

// Update closed trades
function updateClosedTrades() {
    const container = document.getElementById('closedTradesContainer');
    const countBadge = document.getElementById('closedTradesCount');
    
    // Load closed_trades.json
    fetch('closed_trades.json?t=' + Date.now())
        .then(response => response.json())
        .then(closedData => {
            const trades = closedData.closed_trades || [];
            
            // Update count badge
            if (countBadge) {
                countBadge.textContent = trades.length;
            }
            
            if (trades.length === 0) {
                container.innerHTML = '<div class="no-positions">No closed trades yet</div>';
                return;
            }
            
            container.innerHTML = trades.map(trade => createClosedTradeCard(trade)).join('');
        })
        .catch(error => {
            console.error('Error loading closed trades:', error);
            container.innerHTML = '<div class="no-positions">Error loading closed trades</div>';
            if (countBadge) {
                countBadge.textContent = '0';
            }
        });
}

// Create closed trade card
function createClosedTradeCard(trade) {
    const outcomeClass = trade.realized_pnl >= 0 ? 'winner' : 'loser';
    const pnlSign = trade.realized_pnl >= 0 ? '+' : '';
    
    return `
        <div class="closed-trade-card ${outcomeClass}">
            <div class="closed-trade-header">
                <div class="closed-trade-info">
                    <h3>${trade.stock} - ${trade.stock_name}</h3>
                    <div class="closed-trade-dates">
                        ${trade.entry_date} → ${trade.exit_date} (${trade.holding_days} day${trade.holding_days !== 1 ? 's' : ''})
                    </div>
                </div>
                <div class="closed-trade-pnl">
                    <div class="closed-pnl-amount">${pnlSign}${formatCurrency(trade.realized_pnl)}</div>
                    <div class="closed-pnl-percent">${pnlSign}${trade.realized_pnl_percent.toFixed(2)}%</div>
                </div>
            </div>
            
            <div class="closed-trade-details">
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Entry</span>
                    <span class="closed-detail-value">₹${trade.entry_price.toFixed(2)}</span>
                </div>
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Exit</span>
                    <span class="closed-detail-value">₹${trade.exit_price.toFixed(2)}</span>
                </div>
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Quantity</span>
                    <span class="closed-detail-value">${trade.quantity}</span>
                </div>
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Exit Type</span>
                    <span class="closed-detail-value">${trade.exit_type.replace('_', ' ')}</span>
                </div>
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Strategy</span>
                    <span class="closed-detail-value">${trade.strategy}</span>
                </div>
                <div class="closed-detail-item">
                    <span class="closed-detail-label">Sector</span>
                    <span class="closed-detail-value">${trade.sector}</span>
                </div>
            </div>
            
            ${trade.analysis ? `
                <div class="trade-analysis">
                    <div class="analysis-section worked">
                        <h4>What Worked ✓</h4>
                        <ul class="analysis-list">
                            ${trade.analysis.what_worked.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="analysis-section didnt-work">
                        <h4>What Didn't Work ✗</h4>
                        <ul class="analysis-list">
                            ${trade.analysis.what_didnt.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="analysis-section learnings">
                        <h4>Key Learnings 📚</h4>
                        <ul class="analysis-list">
                            ${trade.analysis.key_learnings.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Update lessons learned
function updateLessonsLearned() {
    const container = document.getElementById('lessonsContainer');
    
    // Load portfolio_state.json for lessons
    fetch('portfolio_state.json?t=' + Date.now())
        .then(response => response.json())
        .then(portfolioData => {
            const lessons = portfolioData.lessons_learned?.mistakes_to_avoid || [];
            
            if (lessons.length === 0) {
                container.innerHTML = '<div class="no-positions">No lessons captured yet</div>';
                return;
            }
            
            container.innerHTML = lessons.map(lesson => createLessonCard(lesson)).join('');
        })
        .catch(error => {
            console.error('Error loading lessons:', error);
            container.innerHTML = '<div class="no-positions">Error loading lessons</div>';
        });
}

// Create lesson card
function createLessonCard(lesson) {
    return `
        <div class="lesson-card">
            <div class="lesson-header">
                <div>
                    <div class="lesson-title">⚠️ ${lesson.mistake_description}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px;">
                        ${lesson.date_learned} • ${lesson.mistake_category} • ${lesson.severity}
                    </div>
                </div>
                <div class="lesson-loss">${formatCurrency(lesson.loss_amount)}</div>
            </div>
            
            <div class="lesson-content">
                <div class="lesson-section checklist">
                    <h4>✅ Checklist Before Entry</h4>
                    <ul class="lesson-list">
                        ${lesson.checklist_before_entry.map(item => `<li>${item.replace('✓ ', '')}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="lesson-section redflags">
                    <h4>🚫 Red Flags to Avoid</h4>
                    <ul class="lesson-list">
                        ${lesson.red_flags_to_avoid.map(item => `<li>${item.replace('❌ ', '')}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Update performance metrics
function updatePerformanceMetrics() {
    const metrics = currentData.performance_metrics?.all_time || currentData.performance_metrics || {};
    
    document.getElementById('totalTrades').textContent = metrics.total_trades || 0;
    document.getElementById('winRate').textContent = metrics.win_rate ? metrics.win_rate.toFixed(1) + '%' : 'N/A';
    document.getElementById('avgWin').textContent = metrics.average_win ? formatCurrency(metrics.average_win) : 'N/A';
    document.getElementById('avgLoss').textContent = metrics.average_loss ? formatCurrency(metrics.average_loss) : 'N/A';
}

// Update strategy performance
function updateStrategyPerformance() {
    const container = document.getElementById('strategyContainer');
    const strategies = currentData.performance_metrics?.by_strategy || currentData.strategy_performance || {};
    
    if (Object.keys(strategies).length === 0) {
        container.innerHTML = '<div class="no-positions">No strategy data yet</div>';
        return;
    }
    
    container.innerHTML = Object.entries(strategies).map(([name, stats]) => `
        <div class="strategy-card">
            <h3>${name}</h3>
            <div class="strategy-stats">
                <div class="stat">
                    <span class="stat-label">Trades:</span>
                    <span class="stat-value">${stats.total_trades || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Win Rate:</span>
                    <span class="stat-value">${stats.win_rate ? stats.win_rate.toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">P&L:</span>
                    <span class="stat-value ${(stats.total_pnl || 0) >= 0 ? 'positive' : 'negative'}">
                        ${(stats.total_pnl || 0) >= 0 ? '+' : ''}${formatCurrency(stats.total_pnl || 0)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update risk metrics
function updateRiskMetrics() {
    const risk = currentData.risk_metrics || {};
    
    // Daily loss
    const dailyLossUsed = risk.daily_loss_used || 0;
    const dailyLossLimit = risk.daily_loss_limit || 10000;
    const dailyLossPercent = (dailyLossUsed / dailyLossLimit) * 100;
    document.getElementById('dailyLoss').textContent = 
        `${formatCurrency(dailyLossUsed)} / ${formatCurrency(dailyLossLimit)}`;
    document.getElementById('dailyLossBar').style.width = dailyLossPercent + '%';
    document.getElementById('dailyLossBar').className = 
        'risk-bar-fill ' + (dailyLossPercent > 80 ? 'danger' : dailyLossPercent > 50 ? 'warning' : 'safe');
    
    // Drawdown
    const currentDrawdown = risk.current_drawdown_percent || 0;
    const maxDrawdown = risk.max_drawdown_limit_percent || 15;
    const drawdownPercent = (currentDrawdown / maxDrawdown) * 100;
    document.getElementById('drawdown').textContent = 
        `${currentDrawdown.toFixed(2)}% / ${maxDrawdown}% max`;
    document.getElementById('drawdownBar').style.width = drawdownPercent + '%';
    document.getElementById('drawdownBar').className = 
        'risk-bar-fill ' + (drawdownPercent > 80 ? 'danger' : drawdownPercent > 50 ? 'warning' : 'safe');
    
    // Risk status
    const statusElement = document.getElementById('riskStatus');
    const riskStatus = risk.risk_status || 'ALL_CLEAR';
    statusElement.textContent = riskStatus.replace('_', ' ');
    statusElement.className = 'risk-status ' + riskStatus.toLowerCase();
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

// Toggle collapsible sections
function toggleSection(sectionId) {
    const container = document.getElementById(sectionId + 'Container');
    const toggle = document.getElementById(sectionId + 'Toggle');
    
    container.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
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
