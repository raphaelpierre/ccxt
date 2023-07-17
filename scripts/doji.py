import ccxt
import talib
import numpy as np
import urllib3

urllib3.disable_warnings(urllib3.exceptions.NotOpenSSLWarning)

exchange_id = 'binance'  # Replace with your desired exchange ID

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the tickers for all trading pairs
tickers = exchange.fetch_tickers()

# Sort the tickers by volume in descending order
sorted_tickers = sorted(tickers.values(), key=lambda x: x['baseVolume'], reverse=True)

# Select the top 40 most traded trading pairs
top_tickers = sorted_tickers[:40]

# Define the candlestick pattern to watch (Doji)
candle_pattern = "DOJI"

# Watch for Doji on each trading pair
for ticker in top_tickers:
    symbol = ticker['symbol']
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe='1d', limit=2)  # Fetch the latest 2 OHLCV data points (1 day each)
    close_prices = np.array([candle[4] for candle in ohlcv], dtype=np.float64)  # Closing prices as numpy array

    # Check for the Doji pattern using TA-Lib
    doji = talib.CDLDOJI(ohlcv[:, 1], ohlcv[:, 2], ohlcv[:, 3], ohlcv[:, 4])

    # If a Doji pattern is found, print the result
    if doji[-1] != 0:
        print(f"Doji pattern detected on {symbol}")