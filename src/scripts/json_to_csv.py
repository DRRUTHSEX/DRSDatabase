import pandas as pd
import os
import json

# Path to the JSON file
json_file_path = 'data/company_tickers_exchange.json'
csv_file_path = 'data/company_tickers_exchange.csv'

# Read the JSON file
with open(json_file_path, 'r') as json_file:
    data = json.load(json_file)

# Check the structure of the JSON data
print(type(data))
print(data.keys())

# Assuming the JSON data is a dictionary where the values need to be flattened
# Flatten the JSON data for conversion
flattened_data = []

for key, value in data.items():
    value['symbol'] = key  # Add the key (symbol) to the dictionary
    flattened_data.append(value)

# Convert the flattened data to DataFrame
df = pd.DataFrame(flattened_data)

# Save DataFrame to CSV
df.to_csv(csv_file_path, index=False)

print(f"CSV file saved to {csv_file_path}")
