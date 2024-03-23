import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
import json
from datetime import datetime

# Function to fetch the last timestamp in column W
def fetch_last_timestamp(sheet, worksheet_name):
    worksheet = sheet.worksheet(worksheet_name)
    timestamps = worksheet.col_values(23)  # Assuming the timestamp is in the 23rd column
    return max(timestamps[1:], key=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M:%S'))  # Skip the header and find the latest

# Compare the last timestamp from the sheet with the stored last run timestamp
def check_for_updates(sheet, worksheet_name, last_run_file):
    sheet_last_timestamp = fetch_last_timestamp(sheet, worksheet_name)
    sheet_last_timestamp = datetime.strptime(sheet_last_timestamp, '%Y-%m-%d %H:%M:%S')

    if os.path.exists(last_run_file):
        with open(last_run_file, 'r') as file:
            last_run_timestamp = datetime.strptime(file.read().strip(), '%Y-%m-%d %H:%M:%S')
    else:
        last_run_timestamp = datetime.min

    return sheet_last_timestamp > last_run_timestamp

# Load the credentials and sheet ID from environment variables
credentials = ServiceAccountCredentials.from_json_keyfile_dict(
    json.loads(os.environ['GOOGLE_API_KEYS']),
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
)
gc = gspread.authorize(credentials)
sheet_id = os.environ['SHEET_ID']
last_run_file = 'last_run_timestamp.txt'

# Open the sheet
sheet = gc.open_by_key(sheet_id)

# Check if an update is needed and write the new timestamp
if check_for_updates(sheet, "Full_Database_Backend", last_run_file):
    new_timestamp = fetch_last_timestamp(sheet, "Full_Database_Backend")
    with open(last_run_file, 'w') as file:
        file.write(new_timestamp)
    print("Update required.")
    os.system('exit 0')
else:
    print("No update required.")
    os.system('exit 1')
