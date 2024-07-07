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
worksheet = sheet.worksheet("Test")  # Specify the worksheet name within the spreadsheet to work with

# Connect to the SQLite database
db_file_path = 'data/test/Full_Database_Backend.db'  # Define the path to the database file
if not os.path.exists(db_file_path):
    raise FileNotFoundError(f"Database file not found: {db_file_path}")  # Raise an error if the database file does not exist
conn = sqlite3.connect(db_file_path)  # Open a connection to the SQLite database

# Read data from the database
query = "SELECT Ticker, Exchange, CompanyNameIssuer, CIK FROM full_database_backend"
df_db = pd.read_sql_query(query, conn)  # Execute the SQL query and store the results in a pandas DataFrame

# Read existing data from the Google Sheet, starting from the second row
existing_data = worksheet.get_all_records(head=1)  # Fetch all records from the sheet, skipping the header
df_sheet = pd.DataFrame(existing_data, columns=['Ticker', 'Exchange', 'CompanyNameIssuer', 'CIK'])  # Convert the records into a pandas DataFrame with specific columns

# Merge the data from the database into the sheet's DataFrame
df_merged = pd.merge(df_sheet, df_db, on='Ticker', how='left', suffixes=('_sheet', '_db'))

# Update the merged DataFrame with prioritized database values for specified columns
for col in ['Exchange', 'CompanyNameIssuer', 'CIK']:
    df_merged[col] = df_merged[col + '_db'].combine_first(df_merged[col + '_sheet'])

# Clean up the DataFrame by removing any extra columns
df_merged = df_merged[['Ticker', 'Exchange', 'CompanyNameIssuer', 'CIK']]

# Convert DataFrame to a list of lists for uploading to Google Sheets
update_data = df_merged.values.tolist()

# Update the entire sheet with new data (considering only the relevant columns)
worksheet.update([df_merged.columns.values.tolist()] + update_data, value_input_option='USER_ENTERED')

# Sort the Google Sheet by 'Ticker' column (A) in alphabetical order
worksheet.sort((1, 'asc'))  # Sort the worksheet by the 'Ticker' column

print("Google Sheet updated and sorted successfully.")  # Output success message
