import gspread
import sqlite3
import os
import json
import logging

logging.basicConfig(level=logging.INFO)

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])

# Authenticate with the Google Sheets API
gc = gspread.service_account_from_dict(creds_json)

# Open the Google Sheet using the provided SHEET_ID
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("Full_Database_Backend")

# Get all values from columns A to W (adjust the range if the sheet grows)
data = worksheet.get('A2:W' + str(worksheet.row_count))

# Connect to a SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('database.db')
conn.row_factory = sqlite3.Row  # Set the row factory right after connecting
cursor = conn.cursor()

# Create a table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS full_database_backend (
    Ticker TEXT PRIMARY KEY,
    Exchange TEXT,
    CompanyNameIssuer TEXT,
    TransferAgent TEXT,
    OnlinePurchase TEXT,
    DTCMemberNum TEXT,
    TAURL TEXT,
    TransferAgentPct TEXT,
    IREmails TEXT,
    IRPhoneNum TEXT,
    IRCompanyAddress TEXT,
    IRURL TEXT,
    IRContactInfo TEXT,
    SharesOutstanding TEXT,
    CUSIP TEXT,
    CompanyInfoURL TEXT,
    CompanyInfo TEXT,
    FullProgressPct TEXT,
    CIK TEXT,
    DRS TEXT,
    PercentSharesDRSd TEXT,
    SubmissionReceived TEXT,
    TimestampsUTC TEXT
)
''')

# Function to check if a row needs to be updated based on the Google Sheet data
def row_needs_update(cursor, sheet_row):
    cursor.execute("SELECT * FROM full_database_backend WHERE Ticker = ?", (sheet_row[0],))
    db_row = cursor.fetchone()
    if db_row is None:
        logging.info(f"Inserting new row for Ticker: {sheet_row[0]}")
        return True  # Row does not exist in the database, needs insert
    for idx, col in enumerate(db_row.keys()):
        if str(db_row[col]) != str(sheet_row[idx]):
            logging.info(f"Difference detected for Ticker: {sheet_row[0]} in column: {col}. "
                         f"Sheet value: {sheet_row[idx]}, DB value: {db_row[col]}")
            return True  # Difference found, update needed
    return False  # No differences, update not needed


# Update the database only if there are changes
changes_made = False
for row in data:
    if len(row) != 23:
        logging.warning(f"Skipping row due to incorrect number of elements: {row}")
        continue
    if row_needs_update(cursor, row):
        logging.info(f"Updating row for Ticker: {row[0]}")
        cursor.execute('''
        INSERT OR REPLACE INTO full_database_backend (
            Ticker, Exchange, CompanyNameIssuer, TransferAgent, OnlinePurchase, DTCMemberNum, TAURL,
            TransferAgentPct, IREmails, IRPhoneNum, IRCompanyAddress, IRURL, IRContactInfo, SharesOutstanding,
            CUSIP, CompanyInfoURL, CompanyInfo, FullProgressPct, CIK, DRS, PercentSharesDRSd, SubmissionReceived,
            TimestampsUTC
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tuple(row))
        changes_made = True
    else:
        logging.info(f"No changes for Ticker: {row[0]}, skipping update.")

if changes_made:
    conn.commit()
    print("Database updated because changes were detected.")
else:
    print("No changes detected. Database update skipped.")

# Now query all data from the database for JSON conversion
cursor.execute('SELECT * FROM full_database_backend')
rows = cursor.fetchall()

# Convert the rows to dictionaries
data_json = [dict(ix) for ix in rows]

# Write the data to a JSON file
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data_json, f, ensure_ascii=False, indent=4)

# Close the database connection
cursor.close()
conn.close()
