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
query = "SELECT * FROM full_database_backend"  # Assuming 'full_database_backend' has all required columns
df_db = pd.read_sql_query(query, conn)  # Execute the SQL query and store the results in a pandas DataFrame

# Read existing data from the Google Sheet, considering only the first 27 columns
existing_data = worksheet.get_all_records()  # Fetch all records from the sheet
df_sheet = pd.DataFrame(existing_data).iloc[:, :27]  # Convert the records into a pandas DataFrame and limit to the first 27 columns

# Fill NaN values with empty strings to avoid JSON errors
df_db.fillna('', inplace=True)
df_sheet.fillna('', inplace=True)

# Merge the data from the database into the sheet's DataFrame
df_merged = pd.merge(df_sheet, df_db, on='Ticker', how='outer', suffixes=('', '_db'))  # Merge with a left join to append new entries

# Drop the duplicate columns from the merge (those with '_db' suffix)
df_merged.drop(columns=[col for col in df_merged.columns if '_db' in col], inplace=True)

# Convert DataFrame to a list of lists for uploading to Google Sheets
update_data = [df_merged.columns.tolist()] + df_merged.fillna('').values.tolist()  # Replace NaN with empty strings for JSON compatibility

# Update the Google Sheet with the merged data
worksheet.update(update_data, value_input_option='USER_ENTERED')  # Update with 'USER_ENTERED' to ensure proper data formatting

# Sort the Google Sheet by 'Ticker' column (A) in alphabetical order
worksheet.sort((1, 'asc'))  # Sort the worksheet by the 'Ticker' column

print("Google Sheet updated and sorted successfully.")  # Output success message
