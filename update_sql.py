import gspread
from oauth2client.service_account import ServiceAccountCredentials
import sqlite3
import json
import os

# Load credentials from environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])
credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_json)
gc = gspread.authorize(credentials)

# Open the Google Sheet and the specific tab
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("Full_Database_Backend")

# Get all values from columns A to W and skip the header row (row 1)
cell_range = 'A2:W'
values = worksheet.get(cell_range)

# Connect to the SQLite database (will create one if it doesn't exist)
db = sqlite3.connect('database.db')
cursor = db.cursor()

# Create a table with the appropriate headers and datatypes
# The SQL datatypes might need to be adjusted based on the actual content of the columns
cursor.execute('''
CREATE TABLE IF NOT EXISTS full_database_backend (
    Username TEXT,
    CompanyName TEXT,
    Symbol TEXT,
    FirstName TEXT,
    LastName TEXT,
    Title TEXT,
    PhoneNumber TEXT,
    Email TEXT,
    Address TEXT,
    City TEXT,
    State TEXT,
    ZIP TEXT,
    Country TEXT,
    LastContactDate TEXT,
    ContactFrequency TEXT,
    Notes TEXT,
    Broker TEXT,
    Timestamp DATETIME
)
''')

# Insert or update rows in the database based on the timestamp
for row in values:
    # Extract the timestamp from the row
    timestamp = row[-1]
    # Check if the row already exists in the DB based on the username and timestamp
    cursor.execute('SELECT Timestamp FROM full_database_backend WHERE Username = ? AND Timestamp = ?', (row[0], timestamp))
    exists = cursor.fetchone()
    if not exists:
        # If the row doesn't exist, insert the new data
        cursor.execute('INSERT INTO full_database_backend VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', row)
    else:
        # If the row exists but the timestamp is different, update the row
        cursor.execute('''
        UPDATE full_database_backend
        SET CompanyName=?, Symbol=?, FirstName=?, LastName=?, Title=?, PhoneNumber=?, Email=?, Address=?, City=?, State=?, ZIP=?, Country=?, LastContactDate=?, ContactFrequency=?, Notes=?, Broker=?, Timestamp=?
        WHERE Username=?
        ''', row[1:] + [row[0]])

# Commit changes and close the connection
db.commit()
cursor.close()
db.close()
