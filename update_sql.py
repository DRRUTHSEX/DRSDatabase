import gspread
import sqlite3
import os
import json

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])
credentials = gspread.service_account.Credentials.from_service_account_info(creds_json)

# Authenticate with Google Sheets using the credentials
gc = gspread.authorize(credentials)

# Open the sheet and select the right worksheet by name
worksheet = gc.open_by_key(os.environ['SHEET_ID']).worksheet("Full_Database_Backend")

# Retrieve all data from the worksheet starting at row 2 to skip the headers
data = worksheet.get_all_values()[1:]  # This skips the first row (headers)

# Connect to a SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create a table if it doesn't exist with the specified headers
cursor.execute('''
CREATE TABLE IF NOT EXISTS full_database_backend (
    Ticker TEXT,
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
    TimestampsUTC TEXT,
    PRIMARY KEY (Ticker, TimestampsUTC)
)
''')

# Insert or update values into the database
for row in data:
    cursor.execute('''
    INSERT INTO full_database_backend (
        Ticker, Exchange, CompanyNameIssuer, TransferAgent, OnlinePurchase, DTCMemberNum, TAURL,
        TransferAgentPct, IREmails, IRPhoneNum, IRCompanyAddress, IRURL, IRContactInfo, SharesOutstanding,
        CUSIP, CompanyInfoURL, CompanyInfo, FullProgressPct, CIK, DRS, PercentSharesDRSd, SubmissionReceived,
        TimestampsUTC
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(Ticker, TimestampsUTC) DO UPDATE SET
        Exchange=excluded.Exchange,
        CompanyNameIssuer=excluded.CompanyNameIssuer,
        TransferAgent=excluded.TransferAgent,
        OnlinePurchase=excluded.OnlinePurchase,
        DTCMemberNum=excluded.DTCMemberNum,
        TAURL=excluded.TAURL,
        TransferAgentPct=excluded.TransferAgentPct,
        IREmails=excluded.IREmails,
        IRPhoneNum=excluded.IRPhoneNum,
        IRCompanyAddress=excluded.IRCompanyAddress,
        IRURL=excluded.IRURL,
        IRContactInfo=excluded.IRContactInfo,
        SharesOutstanding=excluded.SharesOutstanding,
        CUSIP=excluded.CUSIP,
        CompanyInfoURL=excluded.CompanyInfoURL,
        CompanyInfo=excluded.CompanyInfo,
        FullProgressPct=excluded.FullProgressPct,
        CIK=excluded.CIK,
        DRS=excluded.DRS,
        PercentSharesDRSd=excluded.PercentSharesDRSd,
        SubmissionReceived=excluded.SubmissionReceived
    ''', tuple(row))

# Commit the changes and close the database connection
conn.commit()
cursor.close()
conn.close()
