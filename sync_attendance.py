import pandas as pd
import json
import os
import hashlib
import re
from datetime import datetime

excel_path = 'attendance_report.xlsx'

# Optional: override specific employee passwords here.
# By default, every employee's password is their own Employee ID (e.g. "NAMAH0011").
employee_passwords = {}

shift_timings = {
    "001": "11:00 - 20:00",
    "002": "11:15 - 20:15",
    "003": "11:30 - 20:30",
    "004": "11:45 - 20:45",
    "005": "12:00 - 21:00",
    "006": "12:15 - 21:15",
    "007": "12:30 - 21:30"
}

MONTH_NAMES = {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December"
}

def extract_year_month(df):
    # Scan top rows for a date like DD-MM-YYYY
    for r in range(min(5, len(df))):
        for c in range(len(df.columns)):
            val = df.iloc[r, c]
            if pd.notna(val):
                m = re.search(r'(\d{2})-(\d{2})-(\d{4})', str(val))
                if m:
                    return m.group(3), m.group(2)
    now = datetime.now()
    return now.strftime("%Y"), now.strftime("%m")

print("1. Reading department sheets and extracting employee details, shifts & password hashes...")
try:
    xls = pd.ExcelFile(excel_path)
    attendance_data = {}
    detected_year = None
    detected_month = None
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
        year_str, month_str = extract_year_month(df)
        if not detected_year:
            detected_year, detected_month = year_str, month_str
        year_month = f"{year_str}-{month_str}"
        month_label = f"{MONTH_NAMES.get(month_str, month_str)} {year_str}"
        
        i = 0
        while i < len(df):
            val = df.iloc[i, 2] if len(df.columns) > 2 else None
            if isinstance(val, str) and val.startswith("NAMAH"):
                emp_id = val.strip()
                name = str(df.iloc[i, 3]).strip() if pd.notna(df.iloc[i, 3]) else ""
                desig = str(df.iloc[i, 9]).strip() if len(df.columns) > 9 and pd.notna(df.iloc[i, 9]) else ""
                
                shift_code = "001"
                for r in range(i, min(i+10, len(df))):
                    row_label = df.iloc[r, 2] if len(df.columns) > 2 else None
                    if row_label == "Shift":
                        for c in range(3, len(df.columns)):
                            sc = df.iloc[r, c]
                            if pd.notna(sc) and str(sc).strip() in shift_timings:
                                shift_code = str(sc).strip()
                                break
                        break
                
                shift_time = shift_timings.get(shift_code, "11:00 - 20:00")
                
                present = str(df.iloc[i, 14]).strip() if len(df.columns) > 14 and pd.notna(df.iloc[i, 14]) else "0"
                hl = str(df.iloc[i, 17]).strip() if len(df.columns) > 17 and pd.notna(df.iloc[i, 17]) else "0"
                wo = str(df.iloc[i, 19]).strip() if len(df.columns) > 19 and pd.notna(df.iloc[i, 19]) else "0"
                absent = str(df.iloc[i, 21]).strip() if len(df.columns) > 21 and pd.notna(df.iloc[i, 21]) else "0"
                leave = str(df.iloc[i, 23]).strip() if len(df.columns) > 23 and pd.notna(df.iloc[i, 23]) else "0"
                paiddays = str(df.iloc[i, 27]).strip() if len(df.columns) > 27 and pd.notna(df.iloc[i, 27]) else "0"
                
                # Password defaults to the employee's own Employee ID
                raw_pin = employee_passwords.get(emp_id, emp_id)
                pin_hash = hashlib.sha256(raw_pin.encode('utf-8')).hexdigest()
                
                dates_row = df.iloc[i+1].values if i+1 < len(df) else []
                arrive_row = df.iloc[i+2].values if i+2 < len(df) else []
                dept_row = df.iloc[i+3].values if i+3 < len(df) else []
                
                status_row = []
                for r in range(i, min(i+10, len(df))):
                    if len(df.columns) > 2 and df.iloc[r, 2] == "Status":
                        status_row = df.iloc[r].values
                        break
                if len(status_row) == 0:
                    status_row = df.iloc[i+6].values if i+6 < len(df) else []
                
                emp_records = []
                for col_idx in range(3, len(dates_row)):
                    day_val = dates_row[col_idx]
                    if pd.notna(day_val):
                        try:
                            day_num = str(int(day_val)).zfill(2)
                            date_str = f"{year_month}-{day_num}"
                            
                            arr_val = arrive_row[col_idx] if col_idx < len(arrive_row) else "00:00"
                            dep_val = dept_row[col_idx] if col_idx < len(dept_row) else "00:00"
                            s_val = status_row[col_idx] if col_idx < len(status_row) else "A"
                            
                            arr_str = str(arr_val).strip() if pd.notna(arr_val) and str(arr_val).strip() != "00:00" else "--:--"
                            dep_str = str(dep_val).strip() if pd.notna(dep_val) and str(dep_val).strip() != "00:00" else "--:--"
                            status_str = str(s_val).strip() if pd.notna(s_val) else "A"
                            
                            emp_records.append({
                                "date": date_str,
                                "time": f"Arr: {arr_str}  |  Dept: {dep_str}",
                                "status": status_str
                            })
                        except:
                            pass
                            
                attendance_data[emp_id] = {
                    "name": name,
                    "designation": desig,
                    "shift": f"Shift {shift_code} ({shift_time})",
                    "month_year": year_month,
                    "month_label": month_label,
                    "pin_hash": pin_hash,
                    "present": present,
                    "hl": hl,
                    "wo": wo,
                    "absent": absent,
                    "leave": leave,
                    "paiddays": paiddays,
                    "records": emp_records
                }
                    
            i += 1

    if detected_year and detected_month:
        attendance_data["_meta"] = {
            "year_month": f"{detected_year}-{detected_month}",
            "month_label": f"{MONTH_NAMES.get(detected_month, detected_month)} {detected_year}"
        }

    public_dir = os.path.join(os.getcwd(), 'public')
    os.makedirs(public_dir, exist_ok=True)
    output_path = os.path.join(public_dir, 'attendance.json')
    
    with open(output_path, 'w') as f:
        json.dump(attendance_data, f, indent=4)

    print("2. Success! attendance.json generated with Employee ID as default password.")

except Exception as e:
    print("CRITICAL ERROR:", e)