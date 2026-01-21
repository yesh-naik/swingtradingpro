#!/usr/bin/env python3
"""
GitHub Actions Script - Auto-update Trading Dashboard
Fetches live prices and updates trading_data.json
"""

import json
import requests
from datetime import datetime
import os

# Groww API endpoint (public, no auth needed for market data)
GROWW_API_BASE = "https://groww.in/v1/api"

def get_live_prices():
    """Fetch live prices for HINDZINC and HINDCOPPER"""
    # Note: This is a simplified version
    # In production, you'd use proper Groww API endpoints
    
    stocks = ["HINDZINC", "HINDCOPPER"]
    prices = {}
    
    for stock in stocks:
        try:
            # Groww public API endpoint for stock quotes
            url = f"https://groww.in/v1/api/stocks_data/v1/accord_hybrid_data/exchange/NSE/segment/CASH/{stock}"
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                ltp = data.get('ltp', 0)
                prices[stock] = float(ltp)
                print(f"✅ {stock}: ₹{ltp}")
            else:
                print(f"⚠️  {stock}: API returned {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching {stock}: {e}")
            return None
    
    return prices if len(prices) == 2 else None


def update_json(prices):
    """Update trading_data.json with new prices"""
    
    try:
        # Load current JSON
        with open('trading_data.json', 'r') as f:
            data = json.load(f)
        
        print("\n📊 Updating positions...")
        
        # Update each position
        for position in data.get('active_positions', []):
            stock = position['stock']
            
            if stock in prices:
                new_price = prices[stock]
                entry_price = position['entry_price']
                shares = position.get('shares') or position.get('quantity', 0)
                
                # Update calculations
                position['current_price'] = new_price
                position['current_value'] = round(new_price * shares, 2)
                position['unrealized_pnl'] = round((new_price - entry_price) * shares, 2)
                position['pnl_percent'] = round(((new_price - entry_price) / entry_price) * 100, 2)
                
                # Update distances
                position['distance_to_sl_percent'] = round(((new_price - position['stop_loss']) / new_price) * 100, 2)
                position['distance_to_t1_percent'] = round(((position['target_1'] - new_price) / new_price) * 100, 2)
                position['distance_to_t2_percent'] = round(((position['target_2'] - new_price) / new_price) * 100, 2)
                
                print(f"  {stock}: ₹{new_price:.2f} | P&L: {'+' if position['unrealized_pnl'] >= 0 else ''}₹{position['unrealized_pnl']:.2f}")
        
        # Update portfolio totals
        total_unrealized = sum(p.get('unrealized_pnl', 0) for p in data.get('active_positions', []))
        deployed = sum(p.get('capital_invested', 0) or p.get('invested_capital', 0) for p in data.get('active_positions', []))
        
        if 'portfolio' in data:
            data['portfolio']['total_pnl'] = round(total_unrealized, 2)
            data['portfolio']['total_pnl_percent'] = round((total_unrealized / deployed) * 100, 2) if deployed > 0 else 0
            data['portfolio']['last_updated'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:30")
        
        # Save updated JSON
        with open('trading_data.json', 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ JSON updated successfully!")
        print(f"📈 Total P&L: {'+' if total_unrealized >= 0 else ''}₹{total_unrealized:.2f} ({'+' if total_unrealized >= 0 else ''}{data['portfolio']['total_pnl_percent']:.2f}%)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating JSON: {e}")
        return False


def main():
    print("=" * 60)
    print("SwingTradingPro - Automated Dashboard Update")
    print("=" * 60)
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}")
    print()
    
    # Check if trading_data.json exists
    if not os.path.exists('trading_data.json'):
        print("❌ ERROR: trading_data.json not found!")
        return False
    
    # Fetch live prices
    print("🔍 Fetching live prices from Groww...")
    prices = get_live_prices()
    
    if not prices:
        print("❌ Failed to fetch prices. Skipping update.")
        return False
    
    # Update JSON
    success = update_json(prices)
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Dashboard update complete!")
        print("🌐 Live at: https://yesh-naik.github.io/swingtradingpro")
        print("=" * 60)
    
    return success


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
