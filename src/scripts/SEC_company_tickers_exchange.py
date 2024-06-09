import gspread
import requests
import os
import json
import aiohttp
import aiofiles
import asyncio

# Load credentials from the environment variable
creds_json = json.loads(os.environ['GOOGLE_API_KEYS'])

# Authenticate with the Google Sheets API
gc = gspread.service_account_from_dict(creds_json)

# Open the Google Sheet using the provided SHEET_ID for "SEC_Company_Tickers_Exchange"
sheet = gc.open_by_key(os.environ['SHEET_ID'])
worksheet = sheet.worksheet("SEC_Company_Tickers_Exchange")

async def fetch_data(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"Error: Received status code {response.status}")
                print("Response body:", await response.text())
                return None

async def write_to_csv(data, filename='data/SEC_company_tickers_exchange.csv'):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    fields = data['fields']  # Assuming 'fields' contains column names
    rows = data['data']
    async with aiofiles.open(filename, mode='w') as file:
        await file.write(','.join(fields) + '\n')  # Write CSV header
        for row in rows:
            await file.write(','.join(str(row[field]) for field in fields) + '\n')
    print(f"CSV file written to {filename}")

async def main():
    url = 'https://www.sec.gov/files/company_tickers_exchange.json'
    print(f"Fetching data from {url}")
    data = await fetch_data(url)
    if data:
        print("Data fetched successfully")
        await write_to_csv(data)
        print("Data written to CSV successfully")
    else:
        print("Failed to fetch or write data")

if __name__ == "__main__":
    asyncio.run(main())
