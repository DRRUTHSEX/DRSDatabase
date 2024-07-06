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
query = "SELECT Ticker, Exchange, CompanyNameIssuer, CUSIP FROM full_database_backend"
df_db = pd.read_sql_query(query, conn)

# Read existing data from the Google Sheet, starting from the second row
existing_data = worksheet.get_all_records(head=1)
df_sheet = pd.DataFrame(existing_data)

# Debug: Print columns of df_db and df_sheet
print("Columns in df_db:", df_db.columns)
print("Columns in df_sheet:", df_sheet.columns)

# Merge the data
df_merged = pd.merge(df_sheet, df_db, on=['Ticker'], how='outer', suffixes=('_sheet', '_db'))

# Debug: Print columns of the merged DataFrame
print("Columns in merged DataFrame:", df_merged.columns)

# Update the columns with new data from the database
df_merged['Exchange'] = df_merged['Exchange_db'].combine_first(df_merged['Exchange_sheet'])
df_merged['CompanyNameIssuer'] = df_merged['CompanyNameIssuer_db'].combine_first(df_merged['CompanyNameIssuer_sheet'])
df_merged['CUSIP'] = df_merged['CUSIP_db'].combine_first(df_merged['CUSIP_sheet'])

# Drop the suffix columns
df_merged.drop(columns=[col for col in df_merged.columns if col.endswith('_sheet') or col.endswith('_db')], inplace=True)

# Convert DataFrame to a list of lists for uploading to Google Sheets
update_data = df_merged[['Ticker', 'Exchange', 'CompanyNameIssuer', 'CUSIP']].values.tolist()

# Find current tickers in the sheet to determine which rows to update or append
current_tickers = {row['Ticker']: idx+2 for idx, row in enumerate(existing_data)}  # +2 because Sheets are 1-indexed and there is a header row

# Prepare batch update data
cells_to_update = []
rows_to_append = []
for data_row in update_data:
    ticker = data_row[0]
    if ticker in current_tickers:
        row_index = current_tickers[ticker]
        # Create a list of gspread Cell objects with the correct row, column, and value to update
        for col_index, value in enumerate(data_row, start=1):  # Sheet columns start at 1
            cells_to_update.append(gspread.Cell(row_index, col_index, value))
    else:
        rows_to_append.append(data_row)

# Perform batch update and append operations
if cells_to_update:
    worksheet.update_cells(cells_to_update, value_input_option='RAW')
if rows_to_append:
    worksheet.append_rows(rows_to_append, value_input_option='RAW')

print("Google Sheet updated successfully.")
