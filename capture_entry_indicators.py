#!/usr/bin/env python3
"""
Entry Indicators Capture - SwingTradingPro
Captures ALL technical indicators at the moment of trade entry
"""

import json
from datetime import datetime
from typing import Dict, Any


def capture_entry_indicators(
    stock: str,
    entry_price: float,
    quote_data: Dict,
    technical_data: Dict = None
) -> Dict[str, Any]:
    """
    Capture comprehensive entry indicators for a trade
    
    Args:
        stock: Stock symbol (e.g., "HINDZINC")
        entry_price: Actual entry price
        quote_data: Market depth/quote data from Groww API
        technical_data: Technical indicators from historical data API
    
    Returns:
        Complete entry indicators dictionary
    """
    
    indicators = {
        "captured_at": datetime.now().isoformat(),
        "entry_price": entry_price,
        
        # Price Levels
        "price_levels": {
            "entry": entry_price,
            "day_open": quote_data.get('open'),
            "day_high": quote_data.get('high'),
            "day_low": quote_data.get('low'),
            "previous_close": quote_data.get('close'),
            "ltp_at_entry": quote_data.get('ltp'),
            "52_week_high": quote_data.get('yearHighPrice'),
            "52_week_low": quote_data.get('yearLowPrice'),
        },
        
        # Volume Data
        "volume_data": {
            "entry_volume": quote_data.get('volume'),
            "avg_volume": None,  # Calculate from historical
            "volume_ratio": None,  # Calculate: current/avg
            "total_buy_qty": quote_data.get('totalBuyQty'),
            "total_sell_qty": quote_data.get('totalSellQty'),
            "buy_sell_ratio": None  # Calculate if data available
        },
        
        # Day Performance
        "day_performance": {
            "day_change": quote_data.get('dayChange'),
            "day_change_percent": quote_data.get('dayChangePerc'),
            "price_range": quote_data.get('high') - quote_data.get('low') if quote_data.get('high') and quote_data.get('low') else None,
            "distance_from_open": ((entry_price - quote_data.get('open', 0)) / quote_data.get('open', 1)) * 100 if quote_data.get('open') else None,
            "distance_from_52w_high": ((quote_data.get('yearHighPrice', 0) - entry_price) / entry_price) * 100 if quote_data.get('yearHighPrice') else None,
            "distance_from_52w_low": ((entry_price - quote_data.get('yearLowPrice', 0)) / quote_data.get('yearLowPrice', 1)) * 100 if quote_data.get('yearLowPrice') else None
        }
    }
    
    # Add technical indicators if provided
    if technical_data:
        indicators.update({
            # RSI
            "rsi_14": technical_data.get('rsi_14'),
            
            # MACD
            "macd_12_26_9": {
                "macd": technical_data.get('macd'),
                "signal": technical_data.get('macd_signal'),
                "histogram": technical_data.get('macd_histogram'),
                "trend": "bullish" if technical_data.get('macd', 0) > technical_data.get('macd_signal', 0) else "bearish"
            },
            
            # Moving Averages
            "moving_averages": {
                "ema_20": technical_data.get('ema_20'),
                "ema_50": technical_data.get('ema_50'),
                "sma_50": technical_data.get('sma_50'),
                "sma_200": technical_data.get('sma_200'),
                "price_vs_ema20": ((entry_price - technical_data.get('ema_20', 0)) / technical_data.get('ema_20', 1)) * 100 if technical_data.get('ema_20') else None,
                "price_vs_sma200": ((entry_price - technical_data.get('sma_200', 0)) / technical_data.get('sma_200', 1)) * 100 if technical_data.get('sma_200') else None
            },
            
            # Bollinger Bands
            "bollinger_bands": {
                "upper": technical_data.get('bb_upper'),
                "middle": technical_data.get('bb_middle'),
                "lower": technical_data.get('bb_lower'),
                "bb_width": technical_data.get('bb_width'),
                "price_position": None  # Calculate: where price sits in bands
            },
            
            # Volatility
            "volatility": {
                "atr_14": technical_data.get('atr_14'),
                "atr_percent": (technical_data.get('atr_14', 0) / entry_price) * 100 if technical_data.get('atr_14') else None
            },
            
            # Momentum
            "momentum": {
                "adx_14": technical_data.get('adx_14'),
                "williams_r": technical_data.get('williams_r'),
                "stochastic_k": technical_data.get('stoch_k'),
                "stochastic_d": technical_data.get('stoch_d')
            }
        })
    
    # Calculate derived metrics
    if indicators['volume_data']['entry_volume'] and indicators['volume_data'].get('avg_volume'):
        indicators['volume_data']['volume_ratio'] = round(
            indicators['volume_data']['entry_volume'] / indicators['volume_data']['avg_volume'],
            2
        )
    
    if indicators['volume_data']['total_buy_qty'] and indicators['volume_data']['total_sell_qty']:
        total = indicators['volume_data']['total_buy_qty'] + indicators['volume_data']['total_sell_qty']
        if total > 0:
            indicators['volume_data']['buy_sell_ratio'] = round(
                indicators['volume_data']['total_buy_qty'] / total,
                2
            )
    
    # Determine breakout type
    if quote_data.get('yearHighPrice'):
        diff_from_high = abs(entry_price - quote_data['yearHighPrice'])
        if diff_from_high / entry_price < 0.01:  # Within 1%
            indicators['breakout_type'] = '52_week_high'
        elif quote_data.get('high') == quote_data.get('yearHighPrice'):
            indicators['breakout_type'] = 'intraday_52w_high'
        elif entry_price > quote_data.get('day_open', 0) * 1.02:
            indicators['breakout_type'] = 'gap_up'
        else:
            indicators['breakout_type'] = 'intraday'
    
    # MACD signal classification
    if technical_data and technical_data.get('macd') and technical_data.get('macd_signal'):
        macd = technical_data['macd']
        signal = technical_data['macd_signal']
        histogram = technical_data.get('macd_histogram', macd - signal)
        
        if macd > signal and histogram > 0:
            indicators['macd_classification'] = 'bullish_crossover'
        elif macd > signal:
            indicators['macd_classification'] = 'bullish'
        elif macd < signal and histogram < 0:
            indicators['macd_classification'] = 'bearish_crossover'
        else:
            indicators['macd_classification'] = 'bearish'
    
    return indicators


def add_entry_to_trade(
    trade_data: Dict,
    entry_indicators: Dict,
    sector_data: Dict = None
) -> Dict:
    """
    Add entry indicators to a trade record
    
    Args:
        trade_data: Existing trade dictionary
        entry_indicators: Output from capture_entry_indicators()
        sector_data: Optional sector performance data
    
    Returns:
        Updated trade dictionary
    """
    
    trade_data['entry_indicators'] = entry_indicators
    
    # Add sector data if provided
    if sector_data:
        trade_data['entry_indicators']['sector_data'] = {
            "sector": sector_data.get('sector'),
            "sector_rank": sector_data.get('rank'),
            "sector_day_change": sector_data.get('day_change_percent'),
            "sector_weekly_change": sector_data.get('week_change_percent'),
            "sector_gainers": sector_data.get('gainers_count'),
            "sector_losers": sector_data.get('losers_count')
        }
    
    return trade_data


# Example usage
if __name__ == "__main__":
    # Example: Capturing indicators for a new trade
    
    # 1. Get quote data from Groww API
    quote_data = {
        'open': 682.00,
        'high': 701.00,
        'low': 680.75,
        'close': 680.75,
        'ltp': 692.00,
        'volume': 20800000,
        'yearHighPrice': 696.90,
        'yearLowPrice': 378.15,
        'dayChange': 11.25,
        'dayChangePerc': 1.65,
        'totalBuyQty': 150000,
        'totalSellQty': 125000
    }
    
    # 2. Get technical indicators from historical data
    technical_data = {
        'rsi_14': 69.32,
        'macd': 7.94,
        'macd_signal': 2.59,
        'macd_histogram': 5.35,
        'ema_20': 648.28,
        'ema_50': 620.45,
        'sma_50': 625.30,
        'sma_200': 580.15,
        'atr_14': 18.50,
        'bb_upper': 710.50,
        'bb_middle': 685.25,
        'bb_lower': 660.00,
        'adx_14': 32.5
    }
    
    # 3. Capture all indicators
    indicators = capture_entry_indicators(
        stock="HINDZINC",
        entry_price=692.00,
        quote_data=quote_data,
        technical_data=technical_data
    )
    
    # 4. Print captured data
    print("✅ Entry Indicators Captured:")
    print(json.dumps(indicators, indent=2))
    
    # 5. Add to trade
    trade = {
        "trade_id": "TRADE_001",
        "stock": "HINDZINC",
        "entry_price": 692.00,
        "quantity": 10
    }
    
    trade = add_entry_to_trade(trade, indicators)
    print("\n✅ Trade with indicators:")
    print(json.dumps(trade['entry_indicators'], indent=2))
