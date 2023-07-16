import ccxt

exchange_id = 'kucoin'  # Replace with your desired exchange ID
symbol = 'BTC/USDT'  # Replace with the trading pair you want to get the order book for

# Create an instance of the exchange
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class()

# Fetch the order book for the specified symbol
order_book = exchange.fetch_order_book(symbol)

# Retrieve bids and asks from the order book
bids = order_book['bids']
asks = order_book['asks']

# Print the order book
print(f"Order Book for {symbol}:")
print("Bids:")
for bid in bids:
    price, amount = bid
    print(f"Price: {price:.8f} | Amount: {amount:.8f}")
print("Asks:")
for ask in asks:
    price, amount = ask
    print(f"Price: {price:.8f} | Amount: {amount:.8f}")
