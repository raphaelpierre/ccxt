import ccxt

exchange_id = 'kucoin'  # Replace with your desired exchange ID
symbol = 'BTC/USDT'  # Replace with the trading pair you want to retrieve the price for

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the ticker data for the specified symbol
ticker = exchange.fetch_ticker(symbol)

# Retrieve the latest price from the ticker
price = ticker['last']

# Print the result
print(f"Current {symbol} price: {price}")
