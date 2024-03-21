import gspread
from oauth2client.service_account import ServiceAccountCredentials
import sqlite3
import json
import os

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])
credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_json, scopes=[
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
])
gc = gspread.authorize(credentials)

# Open the Google Sheet using the provided SHEET_ID
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("Full_Database_Backend")

# Get all values from columns A to W (ensure to adjust the range if the sheet grows)
cell_range = 'A2:W' + str(worksheet.row_count)
data = worksheet.get(cell_range)

# Connect to a SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create a table if it doesn't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS full_database_backend (
    Username TEXT PRIMARY KEY,
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

# Update or insert values into the database
for row in data:
    cursor.execute('''
    INSERT OR REPLACE INTO full_database_backend (
        Username, CompanyName, Symbol, FirstName, LastName, Title,
        PhoneNumber, Email, Address, City, State, ZIP, Country,
        LastContactDate, ContactFrequency, Notes, Broker, Timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', row)

# Commit the changes and close the database connection
conn.commit()
cursor.close()
conn.close()
