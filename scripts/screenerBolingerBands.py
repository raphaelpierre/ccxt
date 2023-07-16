import pandas as pd
import ccxt
import talib

# Initialize the CCXT exchange client
exchange = ccxt.binance()

# Define the symbols (e.g., BTC/USDT, ETH/USDT, etc.)
symbols = ['BTC/USDT']

# Define the timeframe (e.g., 1 hour candles)
timeframe = '4h'

# Define the number of periods for the Bollinger Bands calculation
n_periods = 160

# Define the number of standard deviations for the Bollinger Bands calculation
n_std_dev = 2.8

for symbol in symbols:
    # Fetch historical data from the exchange
    historical_data = exchange.fetch_ohlcv(symbol, timeframe)

    # Convert the data to a pandas DataFrame
    df = pd.DataFrame(historical_data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])

    # Set the timestamp as the index and convert it to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df.set_index('timestamp', inplace=True)

    # Calculate the Bollinger Bands
    df['upper'], df['middle'], df['lower'] = talib.BBANDS(df['close'], timeperiod=n_periods, nbdevup=n_std_dev, nbdevdn=n_std_dev)

    # Identify periods where the price breaks out of the Bollinger Bands
    df['price_above_upper_band'] = df['close'] > df['upper']
    df['price_below_lower_band'] = df['close'] < df['lower']

    # Filter the dataframe to include only periods where the price breaks out of the Bollinger Bands
    breakout_periods = df[(df['price_above_upper_band'] | df['price_below_lower_band'])]

    # Print the breakout periods for the current symbol
    print(f"Symbol: {symbol}\n{breakout_periods}\n")
