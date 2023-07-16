import ccxt
import numpy as np

exchange_id = 'binance'  # Replace with your desired exchange ID
symbol = 'BTC/USDT'  # Replace with the trading pair you want to monitor

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the ticker data for the specified symbol
ticker = exchange.fetch_ticker(symbol)

# Retrieve the latest price from the ticker
price = ticker['last']

# Define the number of periods for RSI calculation
rsi_periods = 14

# Retrieve historical OHLCV data for RSI calculation
ohlcv = exchange.fetch_ohlcv(symbol, timeframe='1h', limit=rsi_periods)

# Extract closing prices from the OHLCV data
close_prices = [candle[4] for candle in ohlcv]

# Calculate the RSI using NumPy
price_changes = np.diff(close_prices)
gains = price_changes.clip(min=0)
losses = -price_changes.clip(max=0)
average_gain = np.mean(gains)
average_loss = np.mean(losses)
rs = average_gain / average_loss
rsi = 100 - (100 / (1 + rs))

# Print the current price and RSI value
print(f"Current {symbol} price: {price}")
print(f"Current RSI for {symbol}: {rsi:.2f}")
