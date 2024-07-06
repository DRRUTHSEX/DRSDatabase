import gspread
import pandas as pd
import os
import json
import sqlite3

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])  # Parse JSON credentials from an environment variable

# Authenticate with the Google Sheets API
gc = gspread.service_account_from_dict(creds_json)  # Use credentials to authenticate and create a Google Sheets client

# Open the Google Sheet using the provided SHEET_ID
sheet = gc.open_by_key(os.environ['SHEET_ID'])  # Open the spreadsheet using the SHEET_ID from environment variables

# Select the worksheet to update
worksheet = sheet.worksheet("Test")

# Connect to the SQLite database
db_file_path = 'data/Full_Database_Backend.db'
conn = sqlite3.connect(db_file_path)
cursor = conn.cursor()

# Read data from the database
query = "SELECT CIK, Ticker, Exchange, CompanyNameIssuer FROM full_database_backend"
df_db = pd.read_sql_query(query, conn)

# Read existing data from the Google Sheet
existing_data = worksheet.get_all_records()
df_sheet = pd.DataFrame(existing_data)

# Merge the data
df_merged = pd.merge(df_sheet, df_db, on=['CIK', 'Ticker'], how='outer', suffixes=('_sheet', '_db'))

# Update the columns with new data from the database
df_merged['CIK'] = df_merged['CIK_db'].combine_first(df_merged['CIK_sheet'])
df_merged['Ticker'] = df_merged['Ticker_db'].combine_first(df_merged['Ticker_sheet'])
df_merged['Exchange'] = df_merged['Exchange_db'].combine_first(df_merged['Exchange_sheet'])
df_merged['CompanyNameIssuer'] = df_merged['CompanyNameIssuer_db'].combine_first(df_merged['CompanyNameIssuer_sheet'])

# Prepare the data to update only the specific columns
update_data = df_merged[['CIK', 'Ticker', 'Exchange', 'CompanyNameIssuer']].values.tolist()

# Update the worksheet with new data for specific columns
for row in update_data:
    cell_list = worksheet.findall(row[0])  # Find all cells with the CIK value
    for cell in cell_list:
        row_number = cell.row
        worksheet.update_cell(row_number, 1, row[0])  # Update CIK column (1st column)
        worksheet.update_cell(row_number, 2, row[1])  # Update Ticker column (2nd column)
        worksheet.update_cell(row_number, 3, row[2])  # Update Exchange column (3rd column)
        worksheet.update_cell(row_number, 4, row[3])  # Update CompanyNameIssuer column (4th column)

print("Google Sheet updated successfully.")
