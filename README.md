# 💹 SwingTradingPro - Live Dashboard

Professional swing trading dashboard with real-time data updates.

**Live Dashboard:** https://yesh-naik.github.io/swingtradingpro

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Upload Files to GitHub

You already have the repo! Now upload these files:

1. Go to https://github.com/yesh-naik/swingtradingpro
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop ALL these files:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `trading_data.json`
   - `README.md` (this file)
4. Click **"Commit changes"**

### Step 2: Enable GitHub Pages

1. In your repo, click **"Settings"** tab
2. Scroll down to **"Pages"** in left sidebar
3. Under **"Source"**, select:
   - **Branch:** `main` (or `master`)
   - **Folder:** `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes

### Step 3: Access Your Dashboard! 🎉

Your dashboard will be live at:
**https://yesh-naik.github.io/swingtradingpro**

Bookmark this URL!

---

## 📊 What's Included

### 1. **Portfolio Overview**
- Total capital, deployed amount, cash available
- Real-time P&L (updated every 2-3 hours)
- Active positions count

### 2. **Live Position Cards**
Each position shows:
- Current price & P&L
- Entry price, shares, capital
- Stop Loss with distance indicator
- Target 1 & Target 2 with progress bars
- Strategy, sector, conviction level
- GTT status indicator
- Days held

### 3. **Performance Metrics**
- Total trades
- Win rate
- Average win/loss
- Risk-reward ratio

### 4. **Strategy Performance**
- Breakout Momentum stats
- Pullback Entry stats  
- Volume Surge stats
- P&L by strategy

### 5. **Risk Monitoring**
- Daily loss limit usage
- Current drawdown
- Risk status (GREEN/YELLOW/RED)

---

## 🔄 How Updates Work

### Automatic Updates

**During Market Hours (9 AM - 4 PM IST):**
- **9:00 AM:** Market open update
- **11:30 AM:** Mid-morning update
- **2:30 PM:** Afternoon update
- **4:00 PM:** Market close update

**What Happens:**
1. Claude fetches live prices from Groww
2. Updates `trading_data.json` with new data
3. Commits changes to GitHub
4. Your dashboard auto-refreshes (60 seconds)

**You see latest data without any manual work!**

---

## 🎯 Dashboard Features

### Auto-Refresh
- Dashboard refreshes every 60 seconds
- Always shows latest data from JSON

### Responsive Design
- Works on desktop, tablet, mobile
- Optimized for all screen sizes

### Color-Coded Data
- 🟢 Green = Profits, gains, safe status
- 🔴 Red = Losses, risks, danger
- 🟡 Yellow = Warnings, caution

### Progress Bars
- Visual distance to Stop Loss
- Visual distance to Targets
- Risk limit usage bars

### Live Indicators
- Last updated timestamp
- GTT active/inactive status
- Days held counter
- Risk status alerts

---

## 📱 Mobile Access

**Add to Home Screen:**

**iOS (Safari):**
1. Open dashboard URL
2. Tap Share icon
3. Tap "Add to Home Screen"
4. Looks like a native app!

**Android (Chrome):**
1. Open dashboard URL
2. Tap Menu (3 dots)
3. Tap "Add to Home Screen"
4. Access like an app!

---

## 🔧 Customization

### Change Refresh Rate

In `app.js`, line ~280:
```javascript
setInterval(() => {
    loadData();
}, 60000); // Change 60000 to desired milliseconds
```

### Change Colors

In `styles.css`, update CSS variables:
```css
:root {
    --primary: #2563eb;     /* Main color */
    --success: #10b981;     /* Green */
    --danger: #ef4444;      /* Red */
    --warning: #f59e0b;     /* Yellow */
}
```

### Add More Metrics

Edit `index.html` to add new sections, then update `app.js` to populate data.

---

## 📊 Data Structure

The `trading_data.json` contains:

```json
{
  "portfolio": {
    "pilot_capital": 50000,
    "deployed_capital": 11854.70,
    "total_unrealized_pnl": 68.30,
    ...
  },
  "active_positions": [
    {
      "stock": "HINDZINC",
      "entry_price": 692.00,
      "current_price": 695.50,
      "unrealized_pnl": 35.00,
      ...
    }
  ],
  "performance_metrics": { ... },
  "risk_metrics": { ... }
}
```

All calculations are automatic!

---

## 🛠️ Troubleshooting

### Dashboard not loading?
1. Check GitHub Pages is enabled
2. Wait 2-3 minutes after enabling
3. Clear browser cache (Ctrl+Shift+R)
4. Check `trading_data.json` exists in repo

### Data not updating?
1. Check commit history - is JSON being updated?
2. Hard refresh browser (Ctrl+Shift+R)
3. Check browser console for errors (F12)

### 404 Error?
1. Verify GitHub Pages is enabled
2. Check branch is set correctly (main/master)
3. Wait a few minutes for deployment

---

## 📈 What Happens Next

### Daily Updates
Claude will update `trading_data.json` every 2-3 hours during market hours:
- Fetch live prices
- Recalculate P&L
- Update JSON in GitHub
- Commit changes

### Your Dashboard
- Automatically shows latest data
- No manual refresh needed
- Access from anywhere

### Trade Events
When targets hit or exits happen:
- JSON updated with trade details
- Position removed or quantity adjusted
- Trade history logged
- Performance metrics recalculated

---

## 🎯 Usage Tips

### Morning Routine
1. Open dashboard (bookmark it!)
2. Review overnight changes
3. Check risk status
4. Note positions near targets

### During Market
1. Dashboard runs in background
2. Auto-refreshes every 60 seconds
3. Groww alerts notify for actions
4. Claude updates data every 2-3 hours

### End of Day
1. Review closing P&L
2. Check performance metrics
3. Plan for next day

### Weekly Review
1. Analyze strategy performance
2. Review win rate
3. Check risk metrics
4. Adjust if needed

---

## 🌟 Pro Features

### Data Export
Right-click on dashboard → Save as PDF for records

### Multiple Devices
Sync across all devices automatically via GitHub

### Sharing
Share dashboard URL with mentor/friends (if public repo)

### Historical Data
GitHub keeps version history of JSON - track changes over time!

---

## 📞 Support

### Issues?
- Check browser console (F12 → Console tab)
- Verify JSON is valid at jsonlint.com
- Clear cache and hard refresh

### Questions?
- Ask Claude in the chat
- Claude will help debug/customize
- Claude maintains the JSON updates

---

## ✅ Checklist

After setup, verify:
- [ ] GitHub Pages enabled
- [ ] Dashboard loads at https://yesh-naik.github.io/swingtradingpro
- [ ] Portfolio summary displays
- [ ] Active positions show
- [ ] Auto-refresh works (watch timestamp)
- [ ] Mobile responsive (check on phone)
- [ ] Bookmarked URL

---

## 🚀 You're All Set!

**Your dashboard is now:**
- ✅ Live on the internet
- ✅ Auto-updating every 60 seconds
- ✅ Synced with trading_data.json
- ✅ Accessible anywhere
- ✅ Mobile-friendly

**Claude will:**
- ✅ Update JSON every 2-3 hours
- ✅ Commit changes to GitHub
- ✅ Keep data always current

**You:**
- ✅ Just open the URL anytime
- ✅ See latest data automatically
- ✅ Monitor from anywhere
- ✅ Zero manual work!

---

**Dashboard URL:** https://yesh-naik.github.io/swingtradingpro

**Bookmark it now!** 🔖

---

Made with ❤️ for systematic swing trading
