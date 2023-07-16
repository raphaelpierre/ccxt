import ccxt
import numpy as np

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

# Calculate relative volume for each trading pair
for ticker in top_tickers:
    symbol = ticker['symbol']
    volume = ticker['baseVolume']
    volume_24h = ticker['quoteVolume']
    
    # Calculate the relative volume
    relative_volume = volume / volume_24h
    
    # Print the result
    print(f"Trading Pair: {symbol} | Relative Volume: {relative_volume:.2f}")
