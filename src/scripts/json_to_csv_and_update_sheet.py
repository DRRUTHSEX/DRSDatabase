import pandas as pd
import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Path to the JSON file
json_file_path = 'data/company_tickers_exchange.json'
csv_file_path = 'data/company_tickers_exchange.csv'

# Read the JSON file
with open(json_file_path, 'r') as json_file:
    data = json.load(json_file)

# Extract fields and data
fields = data['fields']
records = data['data']

# Convert to DataFrame
df = pd.DataFrame(records, columns=fields)

# Save DataFrame to CSV
df.to_csv(csv_file_path, index=False)

print(f"CSV file saved to {csv_file_path}")

# Google Sheets authentication
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])
gc = gspread.service_account_from_dict(creds_json)
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("SEC_Company_Tickers_Exchange")

# Clear existing content in the sheet
worksheet.clear()

# Update Google Sheet with new data
worksheet.update([df.columns.values.tolist()] + df.values.tolist())

print(f"Google Sheet updated with data from {csv_file_path}")
