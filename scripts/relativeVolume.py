import ccxt
import numpy as np

exchange_id = 'binance'  # Replace with your desired exchange ID
symbol = 'BTC/USDT'  # Replace with the trading pair you want to calculate relative volume for

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the ticker data for the specified symbol
ticker = exchange.fetch_ticker(symbol)

# Retrieve the current volume and 24-hour volume from the ticker
volume = ticker['baseVolume']
volume_24h = ticker['quoteVolume']

# Calculate the relative volume
relative_volume = volume / volume_24h

# Print the result
print(f"Relative volume for {symbol}: {relative_volume:.2f}")
