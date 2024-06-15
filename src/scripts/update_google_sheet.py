import gspread
import pandas as pd
import os
import json

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])  # Parse JSON credentials from an environment variable

# Authenticate with the Google Sheets API
gc = gspread.service_account_from_dict(creds_json)  # Use credentials to authenticate and create a Google Sheets client

# Open the Google Sheet using the provided SHEET_ID
sheet = gc.open_by_key(os.environ['SHEET_ID'])  # Open the spreadsheet using the SHEET_ID from environment variables

# Load the CSV data into a pandas DataFrame
csv_file_path = 'data/company_tickers_exchange.csv'
df = pd.read_csv(csv_file_path)

# Select the worksheet to update
worksheet = sheet.worksheet("SEC_Company_Tickers_Exchange")

# Clear the existing content of the worksheet
worksheet.clear()

# Convert DataFrame to a list of lists
data = df.values.tolist()
header = df.columns.tolist()
data.insert(0, header)  # Add header to the data

# Update the worksheet with new data
worksheet.update('A1', data)

print("Google Sheet updated successfully.")
