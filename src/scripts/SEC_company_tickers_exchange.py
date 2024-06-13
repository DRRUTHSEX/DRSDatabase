import requests
import os

# URL of the JSON file
url = "https://www.sec.gov/files/company_tickers_exchange.json"

# Path to the data folder
data_folder = "data"
os.makedirs(data_folder, exist_ok=True)

# Path to the output file
output_file = os.path.join(data_folder, "company_tickers_exchange.json")

# Download the JSON file
response = requests.get(url)
response.raise_for_status()  # Check that the request was successful

# Save the JSON file
with open(output_file, "wb") as f:
    f.write(response.content)

print(f"File saved to {output_file}")
