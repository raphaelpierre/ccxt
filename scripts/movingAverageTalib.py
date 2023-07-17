import ccxt
import talib
import numpy as np

exchange_id = 'kucoin'  # Replace with your desired exchange ID
exchange_id1 ="binance"
symbol = 'ETH/USDT'  # Replace with the trading pair you want to calculate moving averages for

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Create an instance of the exchange
exchange_class1 = getattr(ccxt, exchange_id1)
exchange1 = exchange_class()

# Retrieve the latest price from the ticker
# Fetch the ticker data for the specified symbol
ticker = exchange.fetch_ticker(symbol)
price = ticker['last']

ticker1 = exchange1.fetch_ticker(symbol)
price1 = ticker1['last']
# Fetch the OHLCV data for the specified symbol
ohlcv = exchange.fetch_ohlcv(symbol, timeframe='1h', limit=200)  # Fetch 200 days of OHLCV data

# Extract the closing prices from the OHLCV data
close_prices = np.array([candle[4] for candle in ohlcv], dtype=np.float64)  # Closing prices as numpy array

# Calculate the moving averages using TA-Lib
ma7 = talib.SMA(close_prices, timeperiod=7)[-1]  # 7-day simple moving average
ma50 = talib.SMA(close_prices, timeperiod=50)[-1]  # 50-day simple moving average
ma200 = talib.SMA(close_prices, timeperiod=200)[-1]  # 200-day simple moving average

# Print the results
print(f"Current kucoin {symbol} price: {price}")
print(f"Current binance {symbol} price: {price1}")
print(f"7-day Moving Average for {symbol}: {ma7:.2f}")
print(f"50-day Moving Average for {symbol}: {ma50:.2f}")
print(f"200-day Moving Average for {symbol}: {ma200:.2f}")
