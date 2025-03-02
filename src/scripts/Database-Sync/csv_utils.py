import csv
import os

class CSVHandler:
    def __init__(self, csv_file_path, source_of_truth_columns):
        self.csv_file_path = csv_file_path
        self.source_of_truth_columns = source_of_truth_columns
        # Ensure CSV directory exists
        os.makedirs(os.path.dirname(csv_file_path), exist_ok=True)
        
        # Create the file with headers if it doesn't exist
        if not os.path.exists(csv_file_path) or os.path.getsize(csv_file_path) == 0:
            self._initialize_csv_with_headers()

    def _initialize_csv_with_headers(self):
        # Define headers similar to the database structure
        headers = [
            "Ticker", "Exchange", "Company_Name_Issuer", "Transfer_Agent", "Online_Purchase",
            "DTC_Member_Number", "TA_URL", "Transfer_Agent_Pct", "IR_Emails", "IR_Phone_Number",
            "IR_Company_Address", "IR_URL", "IR_Contact_Info", "Shares_Outstanding", "CUSIP",
            "Company_Info_URL", "Company_Info", "Full_Progress_Pct", "CIK", "DRS",
            "Percent_Shares_DRSd", "Submission_Received", "Timestamps_UTC", "Learn_More_About_DRS",
            "Certificates_Offered", "S_And_P_500", "Incorporated_In"
        ]
        
        with open(self.csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)

    def read_csv_data(self):
        if not os.path.exists(self.csv_file_path):
            return []
            
        with open(self.csv_file_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            data = list(reader)
            if not data:
                return []
            # Skip the header row
            return data[1:]

    def update_csv(self, db_data):
        # Read existing CSV data
        existing_data = self.read_csv_data()
        
        # Create a mapping from lowercase (CIK, Ticker, CompanyNameIssuer) to row
        key_to_row = {}
        for row in existing_data:
            # Ensure row has at least 19 elements to access CIK
            row = row + [''] * (27 - len(row))
            CIK = row[18].strip() if row[18] else ''
            Ticker = row[0].strip() if row[0] else ''
            CompanyNameIssuer = row[2].strip() if row[2] else ''
            ci_key = (CIK.lower(), Ticker.lower(), CompanyNameIssuer.lower())
            key_to_row[ci_key] = row
        
        # Process database data
        updated_rows = []
        
        for db_row in db_data:
            db_row = list(db_row)
            # Extract keys from the DB row
            CIK = db_row[18].strip() if db_row[18] else ''
            Ticker = db_row[0].strip() if db_row[0] else ''
            CompanyNameIssuer = db_row[2].strip() if db_row[2] else ''
            
            # Lowercased key for lookup
            ci_key = (CIK.lower(), Ticker.lower(), CompanyNameIssuer.lower())
            
            if ci_key in key_to_row:
                # Existing row in CSV
                csv_row = key_to_row[ci_key]
                # Update only source-of-truth columns
                for i in self.source_of_truth_columns:
                    if i < len(db_row):
                        csv_row[i] = db_row[i] if db_row[i] else ''
                updated_rows.append(csv_row)
                # Remove from mapping to track processed rows
                del key_to_row[ci_key]
            else:
                # New row from database
                new_row = [''] * 27
                for i in range(min(len(db_row), 27)):
                    new_row[i] = db_row[i] if db_row[i] else ''
                updated_rows.append(new_row)
        
        # Add any remaining CSV rows that weren't in the database
        updated_rows.extend(key_to_row.values())
        
        # Read headers from file
        with open(self.csv_file_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            try:
                headers = next(reader)
            except StopIteration:
                # Use default headers if file is empty
                headers = [
                    "Ticker", "Exchange", "Company_Name_Issuer", "Transfer_Agent", "Online_Purchase",
                    "DTC_Member_Number", "TA_URL", "Transfer_Agent_Pct", "IR_Emails", "IR_Phone_Number",
                    "IR_Company_Address", "IR_URL", "IR_Contact_Info", "Shares_Outstanding", "CUSIP",
                    "Company_Info_URL", "Company_Info", "Full_Progress_Pct", "CIK", "DRS",
                    "Percent_Shares_DRSd", "Submission_Received", "Timestamps_UTC", "Learn_More_About_DRS",
                    "Certificates_Offered", "S_And_P_500", "Incorporated_In"
                ]
        
        # Write updated data back to CSV
        with open(self.csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)
            writer.writerows(updated_rows)
            
        print(f"CSV updated successfully at {self.csv_file_path}") 