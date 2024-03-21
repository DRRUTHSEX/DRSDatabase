# ... (rest of your script before this line)

# Insert or update rows in the database based on the unique key (which we'll assume is the Ticker)
insert_sql = '''
INSERT INTO full_database_backend (
    Ticker, Exchange, CompanyNameIssuer, TransferAgent, OnlinePurchase, DTCMemberNum, TAURL,
    TransferAgentPct, IREmails, IRPhoneNum, IRCompanyAddress, IRURL, IRContactInfo, SharesOutstanding,
    CUSIP, CompanyInfoURL, CompanyInfo, FullProgressPct, CIK, DRS, PercentSharesDRSd, SubmissionReceived,
    TimestampsUTC
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(Ticker) DO UPDATE SET
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
    SubmissionReceived=excluded.SubmissionReceived,
    TimestampsUTC=excluded.TimestampsUTC
'''

for row in data:
    # Ensure that the row has 23 elements as expected
    if len(row) == 23:
        cursor.execute(insert_sql, tuple(row))
    else:
        print(f"Skipping row due to incorrect number of elements: {row}")

# Commit the changes and close the database connection
conn.commit()
cursor.close()
conn.close()
