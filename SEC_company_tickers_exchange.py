import gspread
import requests
import os
import json

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])

# Authenticate with the Google Sheets API
gc = gspread.service_account_from_dict(creds_json)

# Open the Google Sheet using the provided SHEET_ID for "SEC_Company_Tickers_Exchange"
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("SEC_Company_Tickers_Exchange")

# Fetch data from SEC
response = requests.get('https://www.sec.gov/files/company_tickers_exchange.json')
print(response.text)  # Print the raw response text for debugging
if response.text:
    data = response.json()
else:
    print("No data received from API")
    data = {'data': []}  # Ensure the data variable is defined

# Prepare data for insertion
values = []
for item in data['data']:
    # Each item is a dictionary with keys 'cik', 'ticker', 'name', 'exchange'
    row = [item['cik'], item['name'], item['ticker'], item['exchange']]
    values.append(row)

# Clear existing data starting from row 2
worksheet.batch_clear(["A2:D" + str(worksheet.row_count)])

# Update the sheet starting from row 2
worksheet.update('A2', values)
