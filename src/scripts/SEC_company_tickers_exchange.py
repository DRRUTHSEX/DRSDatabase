import requests
import os

# URL of the JSON file
url = "https://www.sec.gov/files/company_tickers_exchange.json"

# Path to the data folder
data_folder = "data"
os.makedirs(data_folder, exist_ok=True)

# Path to the output file
output_file = os.path.join(data_folder, "company_tickers_exchange.json")

# Set headers to mimic a browser request
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

# Download the JSON file
response = requests.get(url, headers=headers)
response.raise_for_status()  # Check that the request was successful

# Save the JSON file
with open(output_file, "wb") as f:
    f.write(response.content)

print(f"File saved to {output_file}")
