import ccxt
import numpy as np

exchange_id = 'binance'  # Replace with your desired exchange ID
symbol = 'BTC/USDT'  # Replace with the trading pair you want to calculate moving averages for

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the OHLCV data for the specified symbol
ohlcv = exchange.fetch_ohlcv(symbol, timeframe='1d', limit=200)  # Fetch 200 days of OHLCV data

# Extract the closing prices from the OHLCV data
close_prices = np.array([candle[4] for candle in ohlcv], dtype=np.float64)  # Closing prices as numpy array

# Calculate the moving averages
ma7 = np.mean(close_prices[-7:])  # 7-day moving average
ma50 = np.mean(close_prices[-50:])  # 50-day moving average
ma200 = np.mean(close_prices)  # 200-day moving average

# Print the results
print(f"7-day Moving Average for {symbol}: {ma7:.2f}")
print(f"50-day Moving Average for {symbol}: {ma50:.2f}")
print(f"200-day Moving Average for {symbol}: {ma200:.2f}")
